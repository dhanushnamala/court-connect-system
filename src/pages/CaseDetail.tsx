import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCase = async () => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching case:", error);
    } else {
      setCaseData(data);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCase();
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!caseData) {
    return (
      <PageLayout>
        <div className="container py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested case could not be found.</p>
            <Link to="/cases">
              <Button>Back to Cases</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>{caseData.title}</CardTitle>
            <CardDescription>Case Number: {caseData.case_number || "N/A"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Description:</strong> {caseData.description}</p>
            <p><strong>Status:</strong> {caseData.status}</p>
            <p><strong>Type:</strong> {caseData.type}</p>
            <p><strong>Filing Date:</strong> {caseData.filingDate || "N/A"}</p>
          </CardContent>
          <CardFooter>
            <Link to="/cases">
              <Button>Back to Cases</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CaseDetail;
