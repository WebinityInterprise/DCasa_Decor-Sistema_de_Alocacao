import React from "react";
import Navbar from "./components/Navbar";
import CarouselHome from "./components/CarouselHome";
import EventGrid from "./components/EventGrid";
import FeaturedGrid from "./components/FeaturedGrid";
import Footer from "./components/Footer";

function App() {
    return (
        <>
            <Navbar />
            <CarouselHome />
            <EventGrid />
            <FeaturedGrid />
            <Footer />
        </>
    );
}

export default App;
