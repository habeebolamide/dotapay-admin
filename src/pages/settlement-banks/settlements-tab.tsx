import { Container } from "@/components/common/container";
import { Fragment } from "react/jsx-runtime";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettlementBanksPage } from "./settlement-banks-page";
import { AutoSettlementListPage } from "../autosettlement-list/autosettlement-list-page";

export function SettlementsTab() {
    return (
        <Fragment>
            <Container>
                <Tabs defaultValue="1">
                    <TabsList className="justify-between px-5 mb-2.5" variant="line">
                        <div className="flex items-center gap-5">
                            <TabsTrigger value="1">Settlement Banking</TabsTrigger>
                            <TabsTrigger value="2">Auto Settlement</TabsTrigger>
                        </div>
                    </TabsList>
                    <ScrollArea className="h-[480px]">
                        <TabsContent value="1">
                            <SettlementBanksPage></SettlementBanksPage>
                        </TabsContent>
                        <TabsContent value="2">
                            <AutoSettlementListPage></AutoSettlementListPage>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </Container>
        </Fragment>
    )
}