import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { HeroSectionComponent } from './sections/hero-section';
import { FeaturedProductsComponent } from './sections/featured-products';
import { CategoriesSectionComponent } from './sections/categories-section';
import { AboutSectionComponent } from './sections/about-section';
import { TestimonialsSectionComponent } from './sections/testimonials-section';
import { OfferBannerComponent } from './sections/offer-banner';
import { GallerySectionComponent } from './sections/gallery-section';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroSectionComponent,
    FeaturedProductsComponent,
    CategoriesSectionComponent,
    AboutSectionComponent,
    TestimonialsSectionComponent,
    OfferBannerComponent,
    GallerySectionComponent,
  ],
  host: { 'class': 'block' },
  template: `
    <app-hero-section />
    <app-categories-section />
    <app-featured-products />
    <app-about-section />
    <app-testimonials-section />
    <app-offer-banner />
    <app-gallery-section />
  `,
})
export class HomeComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('AQDAS - Premium Kerala Spices & Cardamom');
    this.meta.updateTag({ name: 'description', content: 'Buy premium, authentic Kerala spices online. Sourced directly from Idukki, our cardamom, black pepper, and cinnamon offer unparalleled flavor and aroma.' });
    this.meta.updateTag({ property: 'og:title', content: 'AQDAS - Premium Kerala Spices' });
    this.meta.updateTag({ property: 'og:description', content: 'Buy premium, authentic Kerala spices online directly from Idukki.' });
  }
}
