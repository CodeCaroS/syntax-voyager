import type { Metadata } from "next";
import PseudocodeLab from "@/app/components/PseudocodeLab";

export const metadata: Metadata = {
  title: "Flight Simulator",
  description:
    "Run Syntax Voyager pseudocode step by step and inspect changing program state.",
};

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<{
    challenge?: string;
    mission?: string;
    step?: string;
  }>;
}) {
  const { challenge, mission, step } = await searchParams;
  return (
    <PseudocodeLab
      initialChallengeId={challenge}
      missionId={mission}
      missionStepId={step}
    />
  );
}
