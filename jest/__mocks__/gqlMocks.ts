import { MockedResponse } from '@apollo/client/testing';

import { addWatchedAddressMock } from './add-watched-address';
import {
  getAssetByMappedAssetIdAndNetworkCodeMock,
  getAssetPrice,
} from './asset';
import {
  getAssetByAddressAndNetworkCodeMock,
  getAssetsForOrgMock,
  searchAssetsMock,
} from './assets';
import { createBinanceOrderMock } from './binance-order';
import {
  getMappedNetworksForOrgMock,
  getNetworkByChainIdMock,
  getNetworksMock,
} from './networks';
import { getMethodsMock } from './payment-methods';

export const mocks: MockedResponse[] = [
  getAssetsForOrgMock({ currency: 'USD', limit: 10, offset: 0 }),
  getAssetsForOrgMock({ currency: 'USD', limit: 10, offset: 0 }),
  getAssetsForOrgMock({ assetId: 'satoshi123' }),
  getAssetsForOrgMock({ assetId: 'elon123' }),
  getAssetsForOrgMock({ assetId: 'ethereum123' }),
  getAssetsForOrgMock({
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  }),
  getAssetsForOrgMock({}),
  getAssetByMappedAssetIdAndNetworkCodeMock({
    mappedAssetId: 'elon123',
    networkCode: 'ethereum',
  }),
  getAssetByMappedAssetIdAndNetworkCodeMock({
    mappedAssetId: 'elon123',
    networkCode: 'polygon',
  }),
  getAssetByAddressAndNetworkCodeMock({
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    networkCode: 'ethereum',
  }),
  searchAssetsMock(),
  addWatchedAddressMock({
    address: '0x0000000000000000000000000000000000000000',
    assetId: 'polygon123',
    confirmationsToWatch: 3,
    expectedAmount: undefined,
  }),
  addWatchedAddressMock({
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    assetId: 'satoshi123',
    confirmationsToWatch: 3,
    expectedAmount: undefined,
  }),
  addWatchedAddressMock({
    address: '0x0000000000000000000000000000000000000000',
    assetId: 'satoshi123',
    confirmationsToWatch: 3,
    expectedAmount: undefined,
  }),
  addWatchedAddressMock({
    address: '0x0000000000000000000000000000000000000000',
    assetId: 'satoshi123',
    confirmationsToWatch: 3,
    expectedAmount: undefined,
  }),
  addWatchedAddressMock({
    address: '0x0000000000000000000000000000000000000000',
    assetId: 'ethereum123',
    confirmationsToWatch: 3,
    expectedAmount: undefined,
  }),
  getAssetPrice({ assetId: 'satoshi123', currency: 'USD' }),
  getAssetPrice({ assetId: 'ethereum123', currency: 'USD' }),
  getMappedNetworksForOrgMock({ assetId: 'elon123' }),
  getMappedNetworksForOrgMock({ assetId: 'satoshi123' }),
  getMappedNetworksForOrgMock({ assetId: 'ethereum123' }),
  getMappedNetworksForOrgMock({ assetId: 'polygon123' }),
  getNetworkByChainIdMock(1),
  getNetworkByChainIdMock(137),
  getNetworksMock(),
  getMethodsMock({ chainId: null }),
  getMethodsMock({ chainId: 1 }),
  getMethodsMock({ chainId: 137 }),
  createBinanceOrderMock({
    assetId: 'elon123',
    orderAmount: '100.0',
    userId: 'test',
  }),
];
