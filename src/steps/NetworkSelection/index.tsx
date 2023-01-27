import { Badge, CoinLogo } from '@map3xyz/components';
import React, { useContext, useEffect } from 'react';

import ErrorWrapper from '../../components/ErrorWrapper';
import InnerWrapper from '../../components/InnerWrapper';
import LoadingWrapper from '../../components/LoadingWrapper';
import { useGetMappedNetworksForAssetQuery } from '../../generated/apollo-gql';
import { Context, Steps } from '../../providers/Store';

const NetworkSelection: React.FC<Props> = () => {
  const [state, dispatch] = useContext(Context);

  const { data, error, loading, refetch } = useGetMappedNetworksForAssetQuery({
    variables: {
      assetId: state.asset?.config?.mappedAssetId,
    },
  });

  useEffect(() => {
    if (
      data?.mappedNetworksForAssetByOrg?.length === 1 &&
      data.mappedNetworksForAssetByOrg[0]
    ) {
      if (state.prevStep >= Steps.NetworkSelection) {
        dispatch({ payload: Steps.AssetSelection, type: 'SET_STEP' });
      } else {
        dispatch({
          payload: data.mappedNetworksForAssetByOrg[0],
          type: 'SET_NETWORK',
        });
        dispatch({ payload: Steps.PaymentMethod, type: 'SET_STEP' });
      }
    }
  }, [data?.mappedNetworksForAssetByOrg?.length]);

  if (data?.mappedNetworksForAssetByOrg?.length === 1) return null;

  if (!state.asset) {
    dispatch({ payload: Steps.AssetSelection, type: 'SET_STEP' });
    return null;
  }

  if (loading) return <LoadingWrapper message="Fetching Networks..." />;

  if (error)
    return (
      <ErrorWrapper
        description="We couldn't get a list of networks to select."
        header="Error Fetching Networks"
        retry={refetch}
      />
    );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <InnerWrapper className="!pt-0">
          <h3
            className="text-lg font-semibold dark:text-white"
            data-testid="network-select"
          >
            Select Network
          </h3>
        </InnerWrapper>
        <div className="w-full border-t border-neutral-200 bg-neutral-100 px-4 py-3 font-bold leading-6 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
          Send{' '}
          <Badge color="blue" size="large">
            {state.asset.symbol || ''}
          </Badge>{' '}
          on
        </div>
      </div>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="layout-scrollbar relative z-10 flex flex-col dark:text-white">
          {data?.mappedNetworksForAssetByOrg?.map((network) =>
            network ? (
              <div
                className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-sm hover:bg-neutral-100 dark:border-neutral-700 hover:dark:bg-neutral-800"
                key={network.name}
                onClick={() => {
                  dispatch({ payload: network, type: 'SET_NETWORK' });
                  dispatch({ payload: Steps.PaymentMethod, type: 'SET_STEP' });
                }}
                role="button"
              >
                <div className="flex items-center gap-2">
                  <div className="flex w-4 justify-center">
                    <CoinLogo
                      height="h-4"
                      name={network.name || ''}
                      png={network.logo?.png || undefined}
                      svg={network.logo?.svg || undefined}
                      width="w-4"
                    />
                  </div>
                  <span>{network.name}</span>
                </div>
                {state.network?.name === network.name ? (
                  <i className="fa fa-check-circle text-green-400" />
                ) : (
                  <i className="fa fa-chevron-right text-xxs" />
                )}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

type Props = {};

export default NetworkSelection;
