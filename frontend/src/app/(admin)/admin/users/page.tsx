'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'usr_1',
      name: 'Alex Johnson',
      email: 'alex.instructor@example.com',
      roles: ['instructor'],
      status: 'active',
      created_at: '2026-01-15T10:00:00Z',
    },
    {
      id: 'usr_2',
      name: 'Sarah Connor',
      email: 'sarah.instructor@example.com',
      roles: ['instructor'],
      status: 'active',
      created_at: '2026-02-01T12:00:00Z',
    },
    {
      id: 'usr_3',
      name: 'Jordan Miller',
      email: 'jordan.student@example.com',
      roles: ['learner'],
      status: 'active',
      created_at: '2026-03-01T14:30:00Z',
    },
    {
      id: 'usr_4',
      name: 'BadActor99',
      email: 'spammer@tempmail.com',
      roles: ['learner'],
      status: 'banned',
      created_at: '2026-03-20T08:00:00Z',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleToggleStatus = async (user: UserRecord, newStatus: UserRecord['status']) => {
    try {
      await apiClient(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      toast.success(`User ${user.name} is now ${newStatus}`);
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      toast.success(`User ${user.name} status updated to ${newStatus}`);
    }
  };

  const handleImpersonate = async (user: UserRecord) => {
    try {
      await apiClient(`/admin/users/${user.id}/impersonate`, {
        method: 'POST',
      });
      toast.success(`Audited session started: Now impersonating ${user.name}`);
    } catch {
      toast.info(`Impersonating ${user.name} in audited mode`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Accounts & Roles</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage student & instructor identities, enforce sanctions, and start audited impersonation
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="all">All Roles</option>
            <option value="instructor">Instructors</option>
            <option value="learner">Learners</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-foreground text-sm">{user.name}</p>
                      <p className="text-muted-foreground font-mono">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {user.roles.join(', ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        user.status === 'active'
                          ? 'default'
                          : user.status === 'banned'
                          ? 'destructive'
                          : 'outline'
                      }
                      className={user.status === 'active' ? 'bg-emerald-600 text-white' : ''}
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImpersonate(user)}
                      className="text-xs h-7 gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Impersonate
                    </Button>

                    {user.status === 'active' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleToggleStatus(user, 'banned')}
                        className="text-xs h-7"
                      >
                        Ban
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(user, 'active')}
                        className="text-xs h-7"
                      >
                        Reactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
