import { TextBattle } from "@/components/features/text-battle";

export default function LinkedInPage() {
    return (
        <TextBattle
            title="LinkedIn Battle"
            description="Paste two LinkedIn profiles and let AI judge"
            placeholder1="Paste LinkedIn profile text here..."
            placeholder2="Paste LinkedIn profile text here..."
            mode="linkedin"
        />
    );
}
