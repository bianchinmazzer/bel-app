import HeroSection from './components/HeroSection'
import CategoriasDestacadas from './components/CategoriasDestacadas'
import ProductosDestacados from './components/ProductosDestacados'
import TrustStrip from './components/TrustStrip'
import Servicios from './components/Servicios'
import QuienesSomos from './components/QuienesSomos'
import ContactForm from './components/ContactForm'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ProductosDestacados />
      <CategoriasDestacadas />
      <Servicios />
      <QuienesSomos />
      <ContactForm />
    </>
  )
}
