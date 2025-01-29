export interface TestimonialInterface {
  text: string;
  imagePath?: string;
  author?: string;
  role?: string;
  company?: string;
}

export interface TestimonialFormatted extends TestimonialInterface {
  date?: Date;
}

export interface TestimonialProps extends TestimonialFormatted {
  index: number;
}

export interface TestimonialJson extends TestimonialInterface {
  date?: string;
}
