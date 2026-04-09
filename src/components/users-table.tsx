import * as React from "react"
import { useNavigate } from "react-router-dom"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table"

import { UserModel } from "@/types"
import { userDetailPath } from "@/constants/routes"
import { relativeTime, getInitials } from "@/lib/utils"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { MoreHorizontal } from "lucide-react"

interface Props {
    data: UserModel[]
    loading?: boolean
}

export function UsersTable({ data }: Props) {

    const navigate = useNavigate()

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")

    const columns: ColumnDef<UserModel>[] = [

        {
            accessorKey: "fullName",
            header: "Name",
            cell: ({ row }) => {

                const u = row.original

                return (
                    <div className="flex items-center gap-3">

                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {getInitials(u.fullName)}
                        </div>

                        <div>
                            <p className="font-medium">{u.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                                #{u.userId}
                            </p>
                        </div>

                    </div>
                )
            },
        },

        {
            accessorKey: "designation",
            header: "Designation",
        },

        {
            accessorKey: "faceRegistered",
            header: "Face",
            cell: ({ row }) =>
                row.original.faceRegistered
                    ? <Badge>Registered</Badge>
                    : <Badge variant="secondary">Not Registered</Badge>,
        },

        {
            accessorKey: "lastSeen",
            header: "Last Seen",
            cell: ({ row }) => {

                const v = row.original.lastSeen

                return v
                    ? <span className="text-muted-foreground">{relativeTime(v)}</span>
                    : "—"
            },
        },

        {
            id: "actions",

            cell: ({ row }) => {

                const u = row.original

                return (

                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">

                            <DropdownMenuItem
                                onClick={() =>
                                    navigate(userDetailPath(u.userId))
                                }
                            >
                                View Profile
                            </DropdownMenuItem>

                        </DropdownMenuContent>

                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({

        data: data.filter((u) =>
            u.fullName.toLowerCase().includes(globalFilter.toLowerCase()) ||
            u.userId.includes(globalFilter)
        ),

        columns,

        state: {
            sorting,
            globalFilter,
        },

        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

    })

    return (
        <div className="space-y-4">

            {/* Toolbar */}

            <div className="flex items-center gap-3">

                <Input
                    placeholder="Search users..."
                    value={globalFilter}
                    onChange={(e) =>
                        setGlobalFilter(e.target.value)
                    }
                    className="max-w-sm"
                />

                {/* Column toggle */}

                <DropdownMenu>

                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Columns
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (

                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value: boolean | "indeterminate") =>
                                        column.toggleVisibility(value === true)
                                    }
                                >
                                    {column.id}

                                </DropdownMenuCheckboxItem>

                            ))}

                    </DropdownMenuContent>

                </DropdownMenu>

            </div>

            {/* Table */}

            <div className="rounded-md border">

                <Table>

                    <TableHeader>

                        {table.getHeaderGroups().map((headerGroup) => (

                            <TableRow key={headerGroup.id}>

                                {headerGroup.headers.map((header) => (

                                    <TableHead key={header.id}>

                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}

                                    </TableHead>

                                ))}

                            </TableRow>

                        ))}

                    </TableHeader>

                    <TableBody>

                        {table.getRowModel().rows.map((row) => (

                            <TableRow
                                key={row.id}
                                className="cursor-pointer"
                                onClick={() =>
                                    navigate(userDetailPath(row.original.userId))
                                }
                            >

                                {row.getVisibleCells().map((cell) => (

                                    <TableCell key={cell.id}>

                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}

                                    </TableCell>

                                ))}

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </div>

            {/* Pagination */}

            <Pagination>

                <PaginationContent>

                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                table.previousPage()
                            }
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                table.nextPage()
                            }
                        />
                    </PaginationItem>

                </PaginationContent>

            </Pagination>

        </div>
    )
}
