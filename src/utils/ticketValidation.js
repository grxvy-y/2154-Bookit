import { supabase } from '../lib/supabase'

/**
 * Validates a QR code and marks the ticket as used if valid.
 * @param {string} qrCode - The scanned QR code string (UUID)
 * @returns {{ success: boolean, message: string, ticket?: object }}
 */
export async function validateTicket(qrCode) {
  if (!qrCode || !qrCode.trim()) {
    return { success: false, message: 'No QR code provided.' }
  }

  // Fetch ticket with related event and order info
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      id,
      qr_code,
      is_used,
      ticket_type_id,
      order_id,
      orders (
        id,
        total_amount,
        events (
          id,
          title,
          date,
          location
        )
      ),
      ticket_types (
        name,
        price
      )
    `)
    .eq('qr_code', qrCode.trim())
    .single()

  if (error || !ticket) {
    return { success: false, message: 'Invalid ticket — QR code not found.' }
  }

  if (ticket.is_used) {
    return {
      success: false,
      message: 'Ticket already used.',
      ticket,
    }
  }

  // Mark as used
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ is_used: true })
    .eq('id', ticket.id)

  if (updateError) {
    return { success: false, message: 'Could not validate ticket. Try again.' }
  }

  return {
    success: true,
    message: 'Ticket valid — entry granted.',
    ticket,
  }
}
