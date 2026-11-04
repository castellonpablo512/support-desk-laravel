<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function supportUsers(Request $request): JsonResponse
    {
        abort_unless($request->user()->isSupport(), 403);

        return response()->json(['data' => User::query()
            ->where('role', 'support')
            ->orderBy('name')
            ->get(['id', 'name'])]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $tickets = Ticket::query()
            ->with(['requester:id,name,email', 'assignee:id,name,email'])
            ->when(! $user->isSupport(), fn (Builder $query) => $query->where('requester_id', $user->id))
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')->value()))
            ->when($request->filled('priority'), fn (Builder $query) => $query->where('priority', $request->string('priority')->value()))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:10000'],
        ]);

        $ticket = $request->user()->tickets()->create($data)->load('requester:id,name,email');

        return response()->json(['data' => $ticket], 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorizeTicket($request, $ticket);

        return response()->json(['data' => $ticket->load([
            'requester:id,name,email',
            'assignee:id,name,email',
            'comments.user:id,name,role',
        ])]);
    }

    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        abort_unless($request->user()->isSupport(), 403);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['open', 'in_progress', 'resolved', 'closed'])],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'assignee_id' => ['sometimes', 'nullable', Rule::exists('users', 'id')->where('role', 'support')],
        ]);
        abort_if($data === [], 422, 'Incluye al menos un campo para actualizar.');
        $ticket->update($data);

        return response()->json(['data' => $ticket->fresh()->load(['requester:id,name,email', 'assignee:id,name,email'])]);
    }

    public function comment(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorizeTicket($request, $ticket);
        $data = $request->validate(['body' => ['required', 'string', 'max:5000']]);
        $comment = $ticket->comments()->create(['user_id' => $request->user()->id, ...$data]);

        return response()->json(['data' => $comment->load('user:id,name,role')], 201);
    }

    private function authorizeTicket(Request $request, Ticket $ticket): void
    {
        abort_unless($request->user()->isSupport() || $ticket->requester_id === $request->user()->id, 404);
    }
}
