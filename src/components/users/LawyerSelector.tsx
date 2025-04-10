
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  yearsOfExperience: number;
  casesWon: number;
}

const LawyerSelector = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);

  useEffect(() => {
    const fetchLawyers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'lawyer');

      if (data) {
        const enrichedLawyers: Lawyer[] = await Promise.all(
          data.map(async (lawyer) => {
            const { data: specialization } = await supabase
              .from('lawyer_specializations')
              .select('specialization, years_of_experience, cases_won')
              .eq('lawyer_id', lawyer.id)
              .single();

            return {
              id: lawyer.id,
              name: lawyer.name,
              specialization: specialization?.specialization || 'General Practice',
              yearsOfExperience: specialization?.years_of_experience || 0,
              casesWon: specialization?.cases_won || 0
            };
          })
        );

        setLawyers(enrichedLawyers);
      }
    };

    fetchLawyers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Lawyer</CardTitle>
      </CardHeader>
      <CardContent>
        {lawyers.map(lawyer => (
          <div key={lawyer.id} className="border p-4 mb-2 rounded">
            <h3 className="font-bold">{lawyer.name}</h3>
            <p>Specialization: {lawyer.specialization}</p>
            <p>Experience: {lawyer.yearsOfExperience} years</p>
            <p>Cases Won: {lawyer.casesWon}</p>
            <Button className="mt-2">Select Lawyer</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LawyerSelector;
