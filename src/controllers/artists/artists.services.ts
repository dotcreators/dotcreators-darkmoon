import { Artist, PrismaClient } from '@prisma/client'
import { ArtistSearchRequest } from '../../models/query/artists/ArtistSearchRequest'
import { error } from 'elysia'
import { ArtistEditRequest } from '../../models/query/artists/ArtistEditRequest'
import {
  ArtistUpdateRequest,
  BulkArtistUpdateRequest,
} from '../../models/query/artists/ArtistUpdateRequest'

export class ArtistsServices {
  private readonly prisma = new PrismaClient()

  async getArtistsPaginated(
    request: ArtistSearchRequest
  ): Promise<{ data: Artist[]; has_next: boolean }> {
    const orderFilter: any = {}
    if (request.sortBy == 'username') orderFilter.username = 'asc'
    else if (request.sortBy == 'followers') orderFilter.followersCount = 'desc'
    else if (request.sortBy == 'posts') orderFilter.tweetsCount = 'desc'
    else orderFilter.followersCount = 'desc'

    const whereFilter: any = {}
    if (request.username) whereFilter.username = { contains: request.username }
    if (request.country) whereFilter.country = { equals: request.country }
    if (request.tags && request.tags.length > 0)
      whereFilter.tags = { hasEvery: request.tags }

    const data = await this.prisma.artist.findMany({
      take: request.limit,
      skip: (request.page - 1) * request.limit,
      where: Object.keys(whereFilter).length > 0 ? whereFilter : undefined,
      orderBy: orderFilter,
    })

    return {
      data: data as Artist[],
      has_next: data.length === request.limit ? true : false,
    }
  }

  async editArtist(
    artistId: string,
    request: ArtistEditRequest
  ): Promise<Artist> {
    const editFileds: any = {}
    if (request.username) editFileds.username = request.username
    if (request.name) editFileds.name = request.name
    if (request.tags) editFileds.tags = request.tags
    if (request.country) editFileds.country = request.country
    if (request.images) editFileds.images = request.images
    if (request.bio) editFileds.bio = request.bio
    if (request.url) editFileds.url = request.url

    const data = await this.prisma.artist.update({
      where: { id: artistId },
      data: editFileds,
      select: {
        id: true,
        userId: true,
        username: true,
        url: true,
        followersCount: true,
        tweetsCount: true,
        images: true,
        createdAt: true,
        joinedAt: true,
        lastUpdatedAt: true,
        country: true,
        tags: true,
        bio: true,
        name: true,
        website: true,
      },
    })

    return data
  }

  async updateArtistStats(
    artistId: string,
    request: ArtistUpdateRequest
  ): Promise<Artist> {
    const data = await this.prisma.artist.update({
      where: {
        id: artistId,
      },
      data: {
        tweetsCount: request.tweetsCount,
        followersCount: request.followersCount,
      },
      select: {
        id: true,
        userId: true,
        username: true,
        url: true,
        followersCount: true,
        tweetsCount: true,
        images: true,
        createdAt: true,
        joinedAt: true,
        lastUpdatedAt: true,
        country: true,
        tags: true,
        bio: true,
        name: true,
        website: true,
      },
    })

    return data
  }

  async bulkUpdateArtistsStats(request: BulkArtistUpdateRequest[]) {
    try {
      const updatePromises = request.map(request => {
        return this.prisma.artist.updateMany({
          where: {
            id: request.artistId,
          },
          data: {
            tweetsCount: request.tweetsCount,
            followersCount: request.followersCount,
          },
        })
      })

      const results = await Promise.all(updatePromises)

      return results.length
    } catch (e) {
      console.error('Error while bulk updating artists:', e)
      throw e
    }
  }

  async deleteArtist(artistId: string) {
    try {
      const data = this.prisma.artist.delete({
        where: {
          id: artistId,
        },
      })

      return error('OK', 'Gone')
    } catch (e) {
      console.error('Error while deleting artist:', e)
      throw e
    }
  }

  async bulkDeleteArtists(artistsIds: string[]) {
    try {
      const deletePromises = artistsIds.map(id => {
        return this.prisma.artist.delete({
          where: {
            id: id,
          },
        })
      })

      const results = await Promise.all(deletePromises)

      return results.length
    } catch (e) {
      console.error('Error while bulk deleting artist:', e)
      throw e
    }
  }
}
