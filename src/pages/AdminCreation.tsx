
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AdminCreation = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'judge'>('admin');
  const { toast } = useToast();

  const handleCreateUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: `New ${role.charAt(0).toUpperCase() + role.slice(1)}`
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'User Created',
        description: `New ${role} account created successfully`
      });

      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Admin or Judge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={role} onValueChange={(value: 'admin' | 'judge') => setRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="judge">Judge</SelectItem>
            </SelectContent>
          </Select>

          <Input 
            type="email"
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input 
            type="password"
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleCreateUser}>Create User</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCreation;
