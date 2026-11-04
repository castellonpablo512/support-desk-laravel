<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_requesters_can_create_and_only_view_their_own_tickets(): void
    {
        $requester = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($requester);

        $this->postJson('/api/tickets', [
            'subject' => 'No puedo acceder',
            'description' => 'La aplicación muestra un error al iniciar sesión.',
            'status' => 'closed',
            'requester_id' => $other->id,
        ])->assertCreated()->assertJsonPath('data.status', 'open');

        $ticket = Ticket::sole();
        $this->assertSame($requester->id, $ticket->requester_id);
        $this->getJson('/api/tickets')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/tickets/'.$ticket->id)->assertOk();
        $this->getJson('/api/tickets/'.Ticket::create([
            'requester_id' => $other->id,
            'subject' => 'Privado',
            'description' => 'Detalle privado',
        ])->id)->assertNotFound();
    }

    public function test_support_can_filter_assign_and_update_ticket_status_and_priority(): void
    {
        $support = User::factory()->create(['role' => 'support']);
        $ticket = Ticket::create([
            'requester_id' => User::factory()->create()->id,
            'subject' => 'Interrupción',
            'description' => 'El servicio no responde.',
        ]);
        $this->actingAs($support);

        $this->getJson('/api/tickets?status=open')->assertOk()->assertJsonCount(1, 'data');
        $this->patchJson('/api/tickets/'.$ticket->id, [
            'status' => 'in_progress',
            'priority' => 'urgent',
            'assignee_id' => $support->id,
        ])->assertOk()
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.priority', 'urgent')
            ->assertJsonPath('data.assignee.id', $support->id);
    }

    public function test_requesters_cannot_change_ticket_workflow_but_can_comment_on_their_ticket(): void
    {
        $requester = User::factory()->create();
        $ticket = Ticket::create([
            'requester_id' => $requester->id,
            'subject' => 'Consulta',
            'description' => 'Necesito ayuda.',
        ]);
        $this->actingAs($requester);

        $this->patchJson('/api/tickets/'.$ticket->id, ['status' => 'closed'])->assertForbidden();
        $this->postJson('/api/tickets/'.$ticket->id.'/comments', ['body' => '¿Hay novedades?'])
            ->assertCreated()
            ->assertJsonPath('data.user.id', $requester->id);
        $this->getJson('/api/tickets/'.$ticket->id)->assertOk()->assertJsonCount(1, 'data.comments');
    }
}
