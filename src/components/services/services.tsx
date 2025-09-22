

import { serviceTabs } from "@/app/content";
import ServiceTabs from "@/components/serviceTabs/serviceTabs";
import { useState, useEffect } from "react";
import Tabs from "../tabs/tabs";
import Carousel from "../carousel/carousel";


export default function Services() {

    const tabArray = serviceTabs.map(tab => ({
        label: tab.title,
        content: (
            <ServiceTabs
                beginningBlurb={tab.topBlurb}
                listItems={tab.listItems}
                endBlurb={tab.bottomBlurb}
            />
        ),
    }));

        return(
            <Tabs content={tabArray} blue={true} />
        )


}