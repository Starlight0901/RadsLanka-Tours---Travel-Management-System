import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageMeta } from '@/components/common/PageMeta.tsx'
import { DestinationDetail } from '@/components/destinations/DestinationDetail.tsx'
import { Container } from '@/components/ui/Container.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { getDestinationBySlug, getPublishedReviewsForDestination } from '@/data/destinationCatalog.ts'
import { NotFoundPage } from '@/pages/public/NotFoundPage.tsx'
import { applyFirestoreDestination, toCatalogDestination } from '@/services/firebase/destinationAdapter.ts'
import { getPublishedDestinationBySlug, type DestinationRecord } from '@/services/firebase/destinations.ts'
import { listPublishedGalleryItems, type GalleryRecord } from '@/services/firebase/gallery.ts'
import { toCatalogTours } from '@/services/firebase/tourAdapter.ts'
import { filterToursFeaturingDestination, listPublishedTours } from '@/services/firebase/tours.ts'
import type { CatalogTour } from '@/types/tours.ts'

export function DestinationDetailPage() {
  const { slug } = useParams()
  const catalogDestination = slug ? getDestinationBySlug(slug) : undefined
  const [record, setRecord] = useState<DestinationRecord | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryRecord[]>([])
  const [featuredTours, setFeaturedTours] = useState<CatalogTour[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [firestoreReady, setFirestoreReady] = useState(!isFirebaseConfigured)

  useEffect(() => {
    setRecord(null)
    setGalleryItems([])
    setFeaturedTours([])
    setLoadError(null)

    if (!isFirebaseConfigured || !slug) {
      setFirestoreReady(true)
      return
    }

    let active = true
    setFirestoreReady(false)

    void (async () => {
      try {
        const [data, tours, gallery] = await Promise.all([
          getPublishedDestinationBySlug(slug),
          listPublishedTours().catch(() => []),
          listPublishedGalleryItems().catch(() => []),
        ])
        if (!active) {
          return
        }

        setRecord(data)
        setGalleryItems(gallery)
        setLoadError(null)

        if (!data) {
          setFeaturedTours([])
          return
        }

        const matched = filterToursFeaturingDestination(tours, data.id)
        try {
          const catalog = matched.length > 0 ? await toCatalogTours(matched) : []
          if (active) {
            setFeaturedTours(catalog)
          }
        } catch {
          if (active) {
            setFeaturedTours([])
          }
        }
      } catch (error: unknown) {
        if (!active) {
          return
        }
        setRecord(null)
        setGalleryItems([])
        setFeaturedTours([])
        setLoadError(error instanceof Error ? error.message : 'Unable to load this destination.')
      } finally {
        if (active) {
          setFirestoreReady(true)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [slug])

  const matchingRecord = record && slug && record.slug === slug ? record : null

  const destination = useMemo(() => {
    if (catalogDestination && matchingRecord) {
      return applyFirestoreDestination(catalogDestination, matchingRecord, galleryItems)
    }
    if (matchingRecord) {
      return toCatalogDestination(matchingRecord, galleryItems)
    }
    if (catalogDestination) {
      return catalogDestination
    }
    return undefined
  }, [catalogDestination, matchingRecord, galleryItems])

  if (!firestoreReady) {
    return (
      <div className="px-6 py-16">
        <LoadingState label="Loading destination" />
      </div>
    )
  }

  if (!destination) {
    if (loadError) {
      return (
        <Container className="py-16">
          <ErrorState title="Unable to load destination" message={loadError} />
        </Container>
      )
    }
    return <NotFoundPage />
  }

  return (
    <>
      <PageMeta title={destination.name} description={destination.shortDescription || destination.name} />
      {loadError ? (
        <Container className="pt-6">
          <ErrorState title="Unable to load latest details" message={loadError} />
        </Container>
      ) : null}
      <DestinationDetail
        destination={destination}
        tours={matchingRecord ? featuredTours : []}
        reviews={getPublishedReviewsForDestination(destination.id)}
      />
    </>
  )
}
