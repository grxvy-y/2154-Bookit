import { supabase } from '../lib/supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validates a QR code and marks the ticket as used if valid.
 * @param {string} qrCode - The scanned QR code string (UUID)
 * @returns {{ success: boolean, message: string, ticket?: object }}
 */
export async function validateTicket(qrCode) {
  if (!qrCode || !qrCode.trim()) {
    return { success: false, message: 'No QR code provided.' }
  }

  const code = qrCode.trim()

  if (!UUID_REGEX.test(code)) {
    return { success: false, message: 'Invalid QR code format.' }
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
    .eq('qr_code', code)
    .single()

  if (error || !ticket) {
    console.error('Ticket lookup error:', error)
    return { success: false, message: 'Invalid ticket — QR code not found.' }
  }

  if (ticket.is_used) {
    return {
      success: false,
      alreadyUsed: true,
      message: 'Ticket already used.',
      ticket,
    }
  }

  // Atomic conditional update — only succeeds if is_used is still false
  const { data: updatedRows, error: updateError } = await supabase
    .from('tickets')
    .update({ is_used: true })
    .eq('id', ticket.id)
    .eq('is_used', false)
    .select('id')

  if (updateError) {
    console.error('Ticket update error:', updateError)
    return { success: false, message: 'Could not validate ticket. Try again.' }
  }

  if (!updatedRows || updatedRows.length === 0) {
    // Another scanner won the race
    return { success: false, alreadyUsed: true, message: 'Ticket already used.' }
  }

  return {
    success: true,
    message: 'Ticket valid — entry granted.',
    ticket,
  }
}
