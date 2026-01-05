import React from "react";
import CarouselHome from "../components/CarouselHome";
import EventGrid from "../components/EventGrid";
import FeaturedGrid from "../components/FeaturedGrid";
import FeaturedProdutos from "../components/FeaturedProdutos";

export default function Home() {
  return (
    <>
      <CarouselHome />
      <EventGrid />
      <FeaturedGrid />
      <FeaturedProdutos />
    </>
  );
}
