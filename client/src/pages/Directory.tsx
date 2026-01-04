import { useEffect, useState } from 'react'
import { supabase, type User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, MapPin, Briefcase, Users } from 'lucide-react'

export default function Directory() {
  const [alumni, setAlumni] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [batches, setBatches] = useState<string[]>([])
  const [companies, setCompanies] = useState<string[]>([])

  useEffect(() => {
    fetchAlumni()
    fetchFilters()
  }, [])

  const fetchAlumni = async () => {
    try {
      let query = supabase.from('users').select('*').order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,skills.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
        )
      }

      if (filterBatch) {
        query = query.eq('batch', filterBatch)
      }

      if (filterCompany) {
        query = query.eq('company', filterCompany)
      }

      const { data, error } = await query

      if (error) throw error
      
      const processedData = (data || []).map(u => ({
        ...u,
        name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email.split('@')[0]
      }))
      
      setAlumni(processedData)
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilters = async () => {
    try {
      // Fetch unique batches
      const { data: batchData } = await supabase
        .from('users')
        .select('batch')
        .not('batch', 'is', null)

      const uniqueBatches = Array.from(
        new Set(batchData?.map((u) => u.batch).filter(Boolean))
      ) as string[]
      setBatches(uniqueBatches.sort().reverse())

      // Fetch unique companies
      const { data: companyData } = await supabase
        .from('users')
        .select('company')
        .not('company', 'is', null)

      const uniqueCompanies = Array.from(
        new Set(companyData?.map((u) => u.company).filter(Boolean))
      ) as string[]
      setCompanies(uniqueCompanies.sort())
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchAlumni()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterBatch('')
    setFilterCompany('')
    setLoading(true)
    fetchAlumni()
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Alumni Directory</h1>
          <p className="text-lg text-muted-foreground">
            Connect with {alumni.length} JEC MCA alumni across the globe
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 border-2 border-[#D0D6B5]">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Batch Year
                </label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Company
                </label>
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Alumni Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : alumni.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No alumni found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alum) => (
              <Card key={alum.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#EE7674]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#EE7674] font-bold text-lg">
                      {alum.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{alum.name}</h3>
                    {alum.batch && (
                      <p className="text-sm text-muted-foreground">Batch {alum.batch}</p>
                    )}
                  </div>
                </div>

                {alum.designation && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{alum.designation}</span>
                  </div>
                )}

                {alum.company && (
                  <div className="mb-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{alum.company}</span>
                  </div>
                )}

                {alum.location && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{alum.location}</span>
                  </div>
                )}

                {alum.skills && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {alum.skills
                        .split(',')
                        .slice(0, 3)
                        .map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      {alum.skills.split(',').length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{alum.skills.split(',').length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {alum.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {alum.bio}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-sm">
                    View Profile
                  </Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90 text-sm">
                    Connect
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
