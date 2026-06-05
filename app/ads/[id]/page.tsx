import ReportButton from "./ReportButton"
import { prisma } from "@/lib/prisma"

export default async function AdPage({ params }: { params: { id: string } }) {

  const ad = await prisma.foodAd.findUnique({
    where: { id: params.id }
  })

  const userId = "CURRENT_USER_ID" // از session بگیر

  return (
    <div>

      <h1>{ad?.foodName}</h1>
      <p>{ad?.description}</p>

      <ReportButton adId={ad!.id} userId={userId} />

    </div>
  )
}
