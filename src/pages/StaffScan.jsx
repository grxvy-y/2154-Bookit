import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { validateTicket } from '../utils/ticketValidation'
import '../assets/styles/StaffScan.css'

export default function StaffScan() {
  const [scannerActive, setScannerActive] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const scannerRef = useRef(null)

  async function startScanner() {
    if (scannerRef.current) return
    setResult(null)

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner()
          await handleValidation(decodedText)
        },
        () => {}
      )
      setScannerActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      setResult({
        type: 'error',
        message: 'Could not access camera. Check browser permissions or use manual entry below.',
      })
      scannerRef.current = null
    }
  }

  async function stopScanner() {
    if (!scannerRef.current) return
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop()
      }
      scannerRef.current.clear()
    } catch (_) {}
    scannerRef.current = null
    setScannerActive(false)
  }

  async function handleValidation(qrCode) {
    setLoading(true)
    setResult(null)
    const res = await validateTicket(qrCode)
    setLoading(false)

    if (res.success) {
      const t = res.ticket
      const event = t?.orders?.events
      setResult({
        type: 'success',
        message: res.message,
        details: {
          event: event?.title || 'Unknown Event',
          date: event?.date || '—',
          location: event?.location || '—',
          ticketType: t?.ticket_types?.name || '—',
        },
      })
    } else if (res.message.includes('already used')) {
      setResult({ type: 'warning', message: res.message, ticket: res.ticket })
    } else {
      setResult({ type: 'error', message: res.message })
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await stopScanner()
    await handleValidation(manualCode.trim())
    setManualCode('')
  }

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  return (
    <div className="staff-scan-page">
      <h1>Staff QR Scanner</h1>
      <p className="subtitle">Scan a ticket QR code to validate entry</p>

      <div className="scanner-container">
        <div id="qr-reader" />
        <div className="scan-controls">
          {!scannerActive ? (
            <button className="btn btn-primary" onClick={startScanner} disabled={loading}>
              {loading ? 'Validating…' : 'Start Camera'}
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={stopScanner}>
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className={`result-card ${result.type}`}>
          <div className="result-status">
            {result.type === 'success' && '✓ VALID'}
            {result.type === 'error' && '✗ INVALID'}
            {result.type === 'warning' && '⚠ ALREADY USED'}
          </div>
          <p>{result.message}</p>
          {result.details && (
            <div className="result-details">
              <div><strong>Event:</strong> {result.details.event}</div>
              <div><strong>Date:</strong> {result.details.date}</div>
              <div><strong>Location:</strong> {result.details.location}</div>
              <div><strong>Ticket Type:</strong> {result.details.ticketType}</div>
            </div>
          )}
          <button
            className="btn btn-secondary scan-again-btn"
            onClick={() => { setResult(null); startScanner() }}
          >
            Scan Next Ticket
          </button>
        </div>
      )}

      <div className="manual-input-section">
        <h3>Manual Code Entry</h3>
        <form className="manual-input-row" onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Paste QR code UUID…"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Check
          </button>
        </form>
      </div>
    </div>
  )
}
