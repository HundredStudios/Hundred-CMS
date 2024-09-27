import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableFour from "@/components/Tables/TableFour";


import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";



const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Messages" />

      <div className="flex flex-col gap-10 min-h-screen">
      
        <TableFour />
        
        
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
