import React from 'react';

import { AppProps } from './App';
import ErrorWrapper from './components/ErrorWrapper';
import LoadingWrapper from './components/LoadingWrapper';
import {
  Organization,
  useGetAssetByAddressAndNetworkCodeQuery,
  useGetNetworksQuery,
} from './generated/apollo-gql';
import { Store } from './providers/Store';
import Map3SdkSteps from './steps';

const AppWithAddressAndNetwork: React.FC<
  AppProps & { plan: Organization['plan'] }
> = ({ config, onClose, plan }) => {
  const { data, error, loading, refetch } = useGetNetworksQuery();
  const { selection } = config.options || {};
  const { address, networkCode } = selection || {};
  const {
    data: assetData,
    error: assetError,
    loading: assetLoading,
    refetch: assetRefetch,
  } = useGetAssetByAddressAndNetworkCodeQuery({
    fetchPolicy: 'no-cache',
    variables: { address, networkCode },
  });

  if (loading || assetLoading) return <LoadingWrapper />;

  const network = data?.networks?.find(
    (network) => network?.networkCode === networkCode
  );
  const asset = assetData?.assetByAddressAndNetworkCodeForOrganization;

  if (error || assetError || !network || !asset)
    return (
      <ErrorWrapper
        description="We had trouble loading the asset or network selected."
        header="Failed to initialize the SDK"
        retry={() => {
          refetch();
          assetRefetch();
        }}
      />
    );
  return (
    <Store {...config} asset={asset} network={network}>
      <Map3SdkSteps onClose={onClose} plan={plan} />
    </Store>
  );
};
export default AppWithAddressAndNetwork;
