
import React, { useState } from "react";
import DroversGrid from "./DroversGrid";
import DroversMapView from "./DroversMapView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Car, Map } from "lucide-react";
import { Drover } from "@/types/drover";

interface DroversTabsProps {
  drovers: Drover[];
  filtersBar?: React.ReactNode;
}

const DroversTabs: React.FC<DroversTabsProps> = ({ drovers, filtersBar }) => {
  const [activeTab, setActiveTab] = useState("cards");
  return (
    <Tabs defaultValue="cards" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full gap-5 flex bg-white/5 mb-6 rounded-2xl">
        <TabsTrigger value="cards" className="!px-10 w-full data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A] border-transparent border hover:border-white/30">
          <Car className="mr-1" size={18} /> Fichas de Drovers
        </TabsTrigger>
        <TabsTrigger value="map" className="!px-10 w-full data-[state=active]:bg-[#6EF7FF] data-[state=active]:text-[#22142A] border-transparent border hover:border-white/30">
          <Map className="mr-1" size={18} /> Mapa
        </TabsTrigger>
      </TabsList>
      {activeTab === "cards" && filtersBar}
      <TabsContent value="cards">
        <DroversGrid drovers={drovers} />
      </TabsContent>
      <TabsContent value="map">
        <DroversMapView drovers={drovers} />
      </TabsContent>
    </Tabs>
  );
};

export default DroversTabs;

