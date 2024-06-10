import { GSButton } from "@/atoms";
import { Snippet } from "@nextui-org/react";

const DeleteAccount = ({ userId }: { userId?: string }) => {
  const userIdString = userId ? `My UserID is ${userId}` : "";
  return (
    <div style={{ marginTop: "50px" }}>
      <a
        href={`mailto:support@guilded.gg?subject=GDPR Account Deletion Request&body=I would like to withdrawal consent, restriction processing, and request full erasure of all my personal data. ${userIdString}`}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        <GSButton color="danger" variant="bordered">
          📧 Request account deletion
        </GSButton>
      </a>
      <br />
      or
      <br />
      Email:{" "}
      <Snippet hideSymbol variant="bordered">
        support@guilded.gg
      </Snippet>
      <br />
      Message:{" "}
      <Snippet
        hideSymbol
        variant="bordered"
        classNames={{
          pre: "whitespace-pre-line text-pretty",
        }}
      >
        I would like to withdrawal consent, restriction processing, and request full erasure of all
        my personal data under GDPR. {userIdString}
      </Snippet>
    </div>
  );
};

export default DeleteAccount;
