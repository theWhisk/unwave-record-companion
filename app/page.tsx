import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RecordSearchForm from "@/components/RecordSearchForm";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <RecordSearchForm />
      </main>
      <Footer />
    </>
  );
}
