import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import createReducer from './redux/reducers';

jest.mock('./api/shop', () => ({
  getCategories: () => Promise.resolve({ data: [] }),
  getBrands: () => Promise.resolve({ data: [] }),
  getCart: () => Promise.resolve({ data: null }),
}));

jest.mock('./api/apiProduct', () => ({
  getProductsService: () => Promise.resolve({ data: { data: [] } }),
}));
jest.mock('./api/apiVariant', () => ({
  getVariantsService: () => Promise.resolve({ data: { data: [] } }),
}));
jest.mock('./api/apiCategory', () => ({
  getCategoriesService: () => Promise.resolve({ data: { data: [] } }),
}));
jest.mock('./api/apiBrand', () => ({
  getBrandsService: () => Promise.resolve({ data: { data: [] } }),
}));

test('renders the storefront home page', async () => {
  localStorage.clear();
  const store = createStore(createReducer());
  render(<Provider store={store}><App /></Provider>);
  expect(await screen.findByRole('heading', { name: /giải pháp cho nhà vườn/i })).toBeInTheDocument();
});
