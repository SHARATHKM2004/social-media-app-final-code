import { Suspense } from "react";
import RegisterSuccessPag from "./regsuccessclient";

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterSuccessPag />
    </Suspense>
  );
}