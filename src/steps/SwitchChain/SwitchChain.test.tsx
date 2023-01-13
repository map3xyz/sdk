import { generateTestingUtils } from 'eth-testing';
import { ethers } from 'ethers';

import { mockConfig } from '~/jest/__mocks__/mockConfig';
import { web3Mock } from '~/jest/__mocks__/web3Mock';
import { act, fireEvent, render, screen } from '~/jest/test-utils';

import App from '../../App';
import * as useWeb3Mock from '../../hooks/useWeb3';
import SwitchChain from '.';

jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    ethers: {
      ...originalModule.ethers,
      Contract: jest.fn(() => {
        return {
          balanceOf: jest.fn(),
          estimateGas: {
            transfer: jest.fn(() => {
              return ethers.BigNumber.from(21_000);
            }),
          },
        };
      }),
    },
  };
});

describe('SwitchChain', () => {
  const web3MockSpy = jest.spyOn(useWeb3Mock, 'useWeb3');

  const getBalanceMock = jest.fn().mockImplementation(() => ({
    assetBalance: ethers.BigNumber.from('100000000'),
    chainBalance: ethers.BigNumber.from('20000000000000000000'),
  }));
  it('renders', () => {
    render(<SwitchChain />);
    expect(true).toBe(true);
  });
  beforeEach(async () => {
    render(<App config={mockConfig} onClose={() => {}} />);
    await screen.findByText('Loading...');
    const elonCoin = await screen.findByText('ElonCoin');
    fireEvent.click(elonCoin);
    const polygon = await screen.findByText('Polygon');
    fireEvent.click(polygon);
    const metamask = await screen.findByText('MetaMask');
    fireEvent.click(metamask);
  });
  describe('Step', () => {
    const testingUtils = generateTestingUtils({
      providerType: 'MetaMask',
    });
    const mockSwitchChain = jest.fn();
    web3MockSpy.mockImplementation(() => ({
      ...web3Mock,
      getBalance: getBalanceMock,
      switchChain: mockSwitchChain,
    }));
    global.window.ethereum = testingUtils.getProvider();
    global.window.ethereum.providers = [testingUtils.getProvider()];
    // wallet is connected to chainId 1 instead of 137
    act(() => {
      testingUtils.mockConnectedWallet([
        '0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf',
      ]);
    });
    afterEach(() => {
      testingUtils.clearAllMocks();
    });
    it('prompts user to switch chain', async () => {
      const switchChain = (await screen.findAllByText('Switch Chain'))[0];
      expect(switchChain).toBeInTheDocument();
      const oldChain = await screen.findByText('Ethereum');
      expect(oldChain).toBeInTheDocument();
      const newChain = await screen.findByText('Polygon');
      expect(newChain).toBeInTheDocument();
      const confirmSwitchChain = (
        await screen.findAllByText('Switch Chain')
      )[1];
      fireEvent.click(confirmSwitchChain);
      expect(mockSwitchChain).toHaveBeenCalled();
    });
    it('continues to Enter Amount', async () => {
      const enterAmount = await screen.findByText('Enter Amount');
      expect(enterAmount).toBeInTheDocument();
    });
  });
  describe('handleSwitch - addChain Error', () => {
    const testingUtils = generateTestingUtils({
      providerType: 'MetaMask',
    });
    const mockSwitchChain = jest.fn().mockImplementationOnce(() => {
      throw new Error('Unrecognized chain ID');
    });
    const addChainMock = jest.fn().mockImplementationOnce(() => {
      throw new Error('User rejected request');
    });
    beforeAll(() => {
      web3MockSpy.mockImplementation(() => ({
        ...web3Mock,
        addChain: addChainMock,
        getBalance: getBalanceMock,
        switchChain: mockSwitchChain,
      }));
      global.window.ethereum = testingUtils.getProvider();
      global.window.ethereum.providers = [testingUtils.getProvider()];
      testingUtils.mockConnectedWallet(
        // wallet is connected to chainId 1 instead of 137
        ['0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf']
      );
    });
    afterEach(() => {
      testingUtils.clearAllMocks();
    });
    it('attempts to add chain if none exists', async () => {
      const switchChain = (await screen.findAllByText('Switch Chain'))[0];
      expect(switchChain).toBeInTheDocument();
      const oldChain = await screen.findByText('Ethereum');
      expect(oldChain).toBeInTheDocument();
      const newChain = await screen.findByText('Polygon');
      expect(newChain).toBeInTheDocument();
      const confirmSwitchChain = (
        await screen.findAllByText('Switch Chain')
      )[1];
      fireEvent.click(confirmSwitchChain);
      expect(mockSwitchChain).toHaveBeenCalledWith(137);
      expect(addChainMock).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleSwitch - Success', () => {
    const testingUtils = generateTestingUtils({
      providerType: 'MetaMask',
    });
    const mockSwitchChain = jest.fn().mockImplementationOnce(() => {
      throw new Error('Unrecognized chain ID');
    });
    const addChainMock = jest.fn();
    beforeAll(() => {
      web3MockSpy.mockImplementation(() => ({
        ...web3Mock,
        addChain: addChainMock,
        getBalance: getBalanceMock,
        switchChain: mockSwitchChain,
      }));
      global.window.ethereum = testingUtils.getProvider();
      global.window.ethereum.providers = [testingUtils.getProvider()];
      testingUtils.mockConnectedWallet(
        // wallet is connected to chainId 1 instead of 137
        ['0xf61B443A155b07D2b2cAeA2d99715dC84E839EEf']
      );
    });
    afterEach(() => {
      testingUtils.clearAllMocks();
    });
    it('adds chain', async () => {
      const switchChain = (await screen.findAllByText('Switch Chain'))[0];
      expect(switchChain).toBeInTheDocument();
      const oldChain = await screen.findByText('Ethereum');
      expect(oldChain).toBeInTheDocument();
      const newChain = await screen.findByText('Polygon');
      expect(newChain).toBeInTheDocument();
      const confirmSwitchChain = (
        await screen.findAllByText('Switch Chain')
      )[1];
      fireEvent.click(confirmSwitchChain);
      expect(mockSwitchChain).toHaveBeenCalledWith(137);
      expect(addChainMock).toHaveBeenCalled();
    });
  });
});
