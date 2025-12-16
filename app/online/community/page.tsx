"use client";

import Card from "@/components/Card";

export default function CommunityPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Community Gait Comparison
      </h1>
      <p className="text-sm text-slate-600">
        Compare your normalized gait cycle with others anonymously
        based on injury type and recovery time.
      </p>

      <Card title="Coming Next">
        <ul className="list-disc pl-5 text-sm">
          <li>ACL vs non-injury averages</li>
          <li>Recovery timeline overlays</li>
          <li>Percentile bands</li>
          <li>Clinical-style reports</li>
        </ul>
      </Card>
    </div>
  );
}
