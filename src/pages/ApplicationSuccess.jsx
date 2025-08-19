import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ApplicationSuccess() {
  return (
    <div className="min-h-screen bg-base p-4 md:p-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-status-approved" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Application Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-secondary">
            Thank you for submitting your rental application. We have received all your information and documents.
          </p>
          <p className="text-secondary">
            You will receive email updates as your application is reviewed. The typical review process takes 2-3 business days.
          </p>
          <div className="pt-4">
            <Link to={createPageUrl("PublicPortal")}>
              <Button className="btn-primary">
                Return to Properties
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}