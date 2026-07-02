import { USER } from '../data'

const firstName = USER.name.split(' ')[0]

export default function PaymentMessage() {
  return (
    <>
      <span className="font-bold text-liva-orange">Payment successful</span>, {firstName}! Upload your
      documents below — we&apos;ll issue your policy in moments.
    </>
  )
}
