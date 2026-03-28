"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortDirection,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpDownIcon,
  ArrowUpWideNarrowIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { Users } from "@/aactions/shared/types";
import { DataTable } from "@/components/shared/data-table";
import { TablePagination } from "@/components/shared/data-table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import {
  useUsersActions,
  useUsersState,
} from "../../lib/context/data-provider";
import { RowAction } from "../actions";
import { BanUserDialog } from "../dialogs/ban-user-dialog";
import { ChangeRoleDialog } from "../dialogs/change-role-dialog";
import { ResetPasswordDialog } from "../dialogs/reset-password-dialog";

const getSortIcon = (isSorted: false | SortDirection) => {
  if (isSorted === "asc") {
    return <ArrowDownWideNarrowIcon className="size-4" />;
  }
  if (isSorted === "desc") {
    return <ArrowUpWideNarrowIcon className="size-4" />;
  }
  return <ArrowUpDownIcon className="opacity-30 size-4" />;
};

const UsersTableContent = () => {
  const [selectedUserStatus, setSelectedUserStatus] = useState<{
    id: string;
    status: boolean;
  } | null>(null);

  const [selectedUserRole, setSelectedUserRole] = useState<{
    id: string;
    role: "admin" | "issuer" | "user";
  } | null>(null);

  const [userToResetPassword, setUserToResetPassword] = useState<{
    id: string;
    userEmail: string;
  } | null>(null);

  const {
    data,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    total,
    page,
    pageSize,
    loading,
  } = useUsersState();

  const {
    setPage,
    setPageSize,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
    updateStatus,
    updateRole,
    resetPassword,
  } = useUsersActions();

  const handleConfirmBan = useCallback(() => {
    if (selectedUserStatus) {
      const { id, status: newStatus } = selectedUserStatus;

      // 1. Call the action to update the user status
      // newStatus is the intended status (false=Banned, true=Active)
      updateStatus(id, newStatus);

      // 2. Clear the state to close the dialog
      setSelectedUserStatus(null);
    }
  }, [updateStatus, selectedUserStatus]);

  const handleCancelBan = useCallback(() => {
    setSelectedUserStatus(null);
  }, []);

  const handleConfirmRoleChange = useCallback(() => {
    if (selectedUserRole) {
      const { id, role: newRole } = selectedUserRole;

      // Call the context action to update the role
      updateRole(id, newRole);

      // Clear the state to close the dialog
      setSelectedUserRole(null);
    }
  }, [updateRole, selectedUserRole]);

  const handleCancelRoleChange = useCallback(() => {
    setSelectedUserRole(null);
  }, []);

  const handleConfirmPasswordReset = useCallback(() => {
    if (userToResetPassword) {
      // Use the mock function for now
      resetPassword(userToResetPassword.userEmail);

      // Clear the state to close the dialog
      setUserToResetPassword(null);
    }
  }, [resetPassword, userToResetPassword]);

  const handleCancelPasswordReset = useCallback(() => {
    setUserToResetPassword(null);
  }, []);

  const columns: ColumnDef<Users>[] = [
    {
      accessorKey: "avatarId",
      id: "avatarId",
      header: "Profile",
      cell: ({ row }) => {
        const avatarId = row.getValue("avatarId") as string;
        const username = row.getValue("name") as string;
        return (
          <Avatar className="size-8">
            {avatarId ? (
              <AvatarImage
                src={`/api/avatars?fileId=${avatarId}`}
                alt={username}
              />
            ) : null}
            <AvatarFallback className="bg-foreground text-background rounded-lg">
              {getInitials(username)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "$id",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("$id")}</Badge>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Recipient Name
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-[200px] truncate flex items-center gap-2">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "isEmailVerified",
      id: "isEmailVerified",
      header: "Email Verified",
      cell: ({ row }) => {
        const isVerified = row.getValue("isEmailVerified") as boolean;
        return (
          <div className="text-muted-foreground max-w-[200px] truncate flex items-center gap-2">
            <Badge variant={isVerified ? "default" : "outline"}>
              {isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("role")}</div>
      ),
    },
    {
      accessorKey: "isBlocked",
      id: "isBlocked",
      header: "Banned",
      cell: ({ row }) => {
        const isBlocked = row.getValue("isBlocked") as boolean;
        return <div className="font-medium">{isBlocked ? "Yes" : "No"}</div>;
      },
    },
    {
      accessorKey: "$createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-x-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          {getSortIcon(column.getIsSorted())}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatRelativeDate(row.getValue("$createdAt"))}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.getValue("$id") as string;
        const role = row.getValue("role") as string;
        const status = row.getValue("isBlocked") as boolean;
        const email = row.getValue("email") as string;

        return (
          <RowAction
            id={id}
            role={role}
            isBanned={status}
            onStatusChangeRequest={(s) =>
              setSelectedUserStatus({ id, status: s })
            }
            onRoleChangeRequest={(r) => setSelectedUserRole({ id, role: r })}
            onPasswordResetRequest={() =>
              setUserToResetPassword({ id, userEmail: email })
            }
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.$id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize },
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
  });

  return (
    <div className="space-y-2">
      <DataTable
        table={table}
        colCount={columns.length}
        loading={loading}
        loadingMessage="Loading users..."
        emptyMessage="No users registered"
      />
      <Separator />
      <TablePagination
        page={page}
        total={total}
        pageSize={pageSize}
        loading={loading}
        setPage={setPage}
        setPageSize={setPageSize}
      />

      <BanUserDialog
        selectedUserStatus={selectedUserStatus}
        onConfirm={handleConfirmBan}
        onCancel={handleCancelBan}
      />

      <ChangeRoleDialog
        selectedUserRole={selectedUserRole}
        onConfirm={handleConfirmRoleChange}
        onCancel={handleCancelRoleChange}
      />

      <ResetPasswordDialog
        selectedUser={userToResetPassword}
        onConfirm={handleConfirmPasswordReset}
        onCancel={handleCancelPasswordReset}
      />
    </div>
  );
};

export { UsersTableContent };
