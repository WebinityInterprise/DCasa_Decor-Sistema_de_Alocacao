import React from "react";
import CarouselHome from "../components/CarouselHome";
import EventGrid from "../components/EventGrid";
import FeaturedGrid from "../components/FeaturedGrid";
import Footer from "../components/Footer";

export default function Home() {
    return (
        <>
            <CarouselHome />
            <EventGrid />
            <FeaturedGrid />
        </>
    );
}
