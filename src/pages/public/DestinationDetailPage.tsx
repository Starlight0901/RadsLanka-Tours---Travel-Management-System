import { useParams } from 'react-router-dom'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { DestinationDetail } from '@/components/destinations/DestinationDetail.tsx'
import {
  getDestinationBySlug,
  getPublishedReviewsForDestination,
  getToursForDestination,
} from '@/data/destinationCatalog.ts'
import { NotFoundPage } from '@/pages/public/NotFoundPage.tsx'

export function DestinationDetailPage() {
  const { slug } = useParams()
  const destination = slug ? getDestinationBySlug(slug) : undefined

  if (!destination) {
    return <NotFoundPage />
  }

  return (
    <>
      <PageMeta title={destination.name} description={destination.shortDescription} />
      <DestinationDetail
        destination={destination}
        tours={getToursForDestination(destination.id)}
        reviews={getPublishedReviewsForDestination(destination.id)}
      />
    </>
  )
}
