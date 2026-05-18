import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/PageHeader"
import { mockUsers } from "@/lib/mockData"
import { UsersTable } from "@/components/users-table"
import { axiosInstance } from "@/lib/axios"

export default function UsersPage() {

  const { data: users = [], isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const res =
      await axiosInstance.get(
        '/users/admin'
      )

    return res.data
  },
})

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Users"
        subtitle={`${users.length} members in your department`}
      />

      <UsersTable
        data={users}
        loading={isLoading}
      />

    </div>
  )
}
