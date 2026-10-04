import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import Image from 'next/image';
export default function CoachsSection() {
  return (
    <section id="coach" className="w-full py-10 ">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Our<span className="text-primary"> Coachs</span>
          </h2>
          {/*                     <p className="mt-6">Harum quae dolore orrupti aut temporibus ariatur.</p>
           */}{' '}
        </div>
        <div className="mx-auto mt-12 flex flex-wrap justify-center gap-3 my-8">
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="AVATAR UFTIPAL"
              src="https://randomuser.me/api/portraits/men/1.jpg"
              width={180}
              height={180}
              priority={false} // optional, default lazy
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="AVATAR UFITPAL"
              src="https://randomuser.me/api/portraits/men/2.jpg"
              width={180}
              height={180}
              priority={false} // optional, default lazy
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/3.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/4.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/5.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/6.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/7.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/1.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/8.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/9.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
          <Link
            href="https://github.com/meschacirung"
            target="_blank"
            title="Méschac Irung"
            className="size-18 rounded-full border *:size-full *:rounded-full *:object-cover hover:scale-110 transition-transform duration-200 bg-primary/90"
          >
            <Image
              alt="John Doe"
              src="https://randomuser.me/api/portraits/men/10.jpg"
              width={180}
              height={180}
              priority={false}
              className="rounded-full"
            />
          </Link>
        </div>
        <div className="flex justify-center ">
          <Button className="w-full md:w-auto" asChild>
            <Link href="/coach">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
