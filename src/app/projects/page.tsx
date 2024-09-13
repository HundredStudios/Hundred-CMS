import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";



import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Projects" />

      <div className="flex flex-col gap-10">
      <TableThree />
        <TableOne />
        
        
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
