import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'

import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'

import { axiosInstance } from '@/lib/axios'
import { toast } from '@/stores/uiStore'
import { Textarea } from '@/components/ui/textarea'

export default function NotificationsPage() {

  const [
    recipientId,
    setRecipientId
  ] = useState('')

  const [
    title,
    setTitle
  ] = useState('')

  const [
    body,
    setBody
  ] = useState('')

  // Users dropdown
  const {
    data: users = []
  } = useQuery({
    queryKey: [
      'user-options'
    ],

    queryFn: async () => {

      const res =
        await axiosInstance.get(
          '/users/admin/options'
        )

      return res.data
    },
  })

  // Send
  const sendNotification =
    useMutation({

      mutationFn:
        async () => {

          const res =
            await axiosInstance.post(
              '/notifications/admin/send',
              {
                recipientId,
                title,
                body,
                type: 'general'
              }
            )

          return res.data
        },

      onSuccess: () => {

        setRecipientId('')
        setTitle('')
        setBody('')

        toast(
          'Notification sent',
          'success'
        )
      },
    })

  return (

    <div className="space-y-6">

      <PageHeader
        title="Send Notification"
        subtitle="Send a direct notification to a user"
      />

      <Card>

        <CardContent className="p-6 space-y-5">

          {/* User */}
          <div className="space-y-2">

            <p className="text-sm font-medium">
              Select User
            </p>

            <Select
              value={recipientId}
              onValueChange={
                setRecipientId
              }
            >

              <SelectTrigger>

                <SelectValue
                  placeholder="Choose a user"
                />

              </SelectTrigger>

              <SelectContent>

                {users.map(
                  (
                    u: any
                  ) => (

                    <SelectItem
                      key={u.id}
                      value={u.id}
                    >
                      {u.fullName}
                    </SelectItem>

                  )
                )}

              </SelectContent>

            </Select>

          </div>

          {/* Title */}
          <div className="space-y-2">

            <p className="text-sm font-medium">
              Title
            </p>

            <Input
              value={title}
              onChange={e =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Notification title"
            />

          </div>

          {/* Body */}
          <div className="space-y-2">

            <p className="text-sm font-medium">
              Message
            </p>

            <Textarea
              rows={6}
              value={body}
              onChange={(e: any) =>
                setBody(
                  e.target.value
                )
              }
              placeholder="Type your message..."
            />

          </div>

          <Button
            className="w-full"
            disabled={
              !recipientId ||
              !title ||
              !body
            }
            onClick={() =>
              sendNotification.mutate()
            }
          >
            Send Notification
          </Button>

        </CardContent>

      </Card>

    </div>
  )
}