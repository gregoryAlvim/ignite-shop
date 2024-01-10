import { stripe } from '@/src/lib/stripe'
import {
  ImageContainer,
  ProductContainer,
  ProductDetails,
} from '@/src/styles/pages/product'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import Stripe from 'stripe'

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    description: string
    price: string
  }
}

export default function Product({ product }: ProductProps) {
  const { isFallback } = useRouter()

  if (isFallback) {
    return <p>Loading...</p>
  }

  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageUrl} width={520} height={480} alt="" />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>

        <p>{product.description}</p>

        <button>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_PL7E05HIrPKQ8m' } },
      { params: { id: 'prod_PL7DAH2D0FYXP0' } },
      { params: { id: 'prod_PL7DvcjE8Txyrr' } },
      { params: { id: 'prod_PL7Cw3OD2m0NKJ' } },
    ],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
  params,
}) => {
  if (params && params.id) {
    const productId = params.id

    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    })

    const price = product.default_price as Stripe.Price

    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0],
          description: product.description,
          price: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format((price.unit_amount ?? 0) / 100),
        },
      },
      revalidate: 60 * 60 * 1,
    }
  }

  return {
    props: {},
  }
}
