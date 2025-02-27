import { Metadata } from 'next';
import { FC } from 'react';

import { IBasePageProps } from 'src/types/common.type';

interface IProductDetailPageProps extends IBasePageProps {}

export const metadata: Metadata = {
  title: 'Product Detail Page'
};

const ProductDetailPage: FC<IProductDetailPageProps> = ({ params }) => {
  return <div>ProductDetailPage: {params.id}</div>;
};

export default ProductDetailPage;
