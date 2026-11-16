/** Terms line with decorative Terms & Conditions control (demo — no navigation). */
export default function TermsAcceptanceLine({ className = '' }) {
  return (
    <p className={className}>
      I hereby accept all the{' '}
      <button
        type="button"
        onClick={(e) => e.preventDefault()}
        className="inline font-semibold text-liva-orange underline decoration-liva-orange/45 underline-offset-2 transition-colors hover:text-liva-orange-light"
      >
        Terms &amp; Conditions
      </button>
      .
    </p>
  )
}