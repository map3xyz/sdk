import { CoinLogo, Input } from '@map3xyz/components';
import React, { ChangeEvent, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';

import ErrorWrapper from '../../components/ErrorWrapper';
import InnerWrapper from '../../components/InnerWrapper';
import ListItem from '../../components/ListItem';
import LoadingWrapper from '../../components/LoadingWrapper';
import StepTitle from '../../components/StepTitle';
import {
  Asset,
  useGetAssetsForOrgQuery,
  useSearchAssetsLazyQuery,
} from '../../generated/apollo-gql';
import { Context, Steps } from '../../providers/Store';
import { debounce } from '../../utils/debounce';

const AssetSelection: React.FC<Props> = () => {
  const [state, dispatch] = useContext(Context);
  const [formValue, setFormValue] = useState<FormData>();
  const [atAssetLimit, setAtAssetLimit] = useState(false);
  const { t } = useTranslation();

  const { data, error, fetchMore, loading, refetch } = useGetAssetsForOrgQuery({
    fetchPolicy: 'network-only',
    variables: {
      currency: state.fiat,
      limit: 10,
      offset: 0,
    },
  });

  const [
    search,
    { data: searchData, loading: searching },
  ] = useSearchAssetsLazyQuery();

  const debouncedSearch = useCallback(debounce(search, 100), []);

  if (loading) return <LoadingWrapper />;

  if (error) {
    return (
      <ErrorWrapper
        description={t('copy.error_fetching_assets')}
        header={t('title.error_fetching_assets')}
        retry={() => refetch()}
        stacktrace={JSON.stringify(error, null, 2)}
      />
    );
  }

  const isSearch =
    searchData?.searchAssetsForOrganization?.length &&
    formValue?.get('asset-search');

  const isEmptySearch =
    !searchData?.searchAssetsForOrganization?.length &&
    formValue?.get('asset-search');

  const assets = isSearch
    ? searchData.searchAssetsForOrganization
    : data?.assetsForOrganization;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-primary-200 dark:border-primary-700 dark:bg-primary-900">
        <InnerWrapper>
          <StepTitle testId="select-asset" value={t('copy.select_asset')} />
          {assets?.length && assets.length > 6 ? (
            <form
              className="mt-2"
              onChange={(e) => setFormValue(new FormData(e.currentTarget))}
            >
              <Input
                icon={<i className="fa fa-search" />}
                name="asset-search"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  debouncedSearch({
                    variables: {
                      query: e.target.value,
                    },
                  })
                }
                placeholder={t('copy.search_for_an_asset') || ''}
                rounded
              />
            </form>
          ) : null}
        </InnerWrapper>
      </div>
      <div className="flex h-full flex-col overflow-hidden">
        <div className="layout-scrollbar relative z-10 flex flex-col dark:text-white">
          {searching ? (
            <LoadingWrapper />
          ) : formValue?.get('asset-search') && isEmptySearch ? (
            <ErrorWrapper
              description={t('copy.no_assets_found')}
              header={t('title.no_assets_found')}
              retry={() =>
                search({
                  variables: { query: formValue.get('asset-search') as string },
                })
              }
            />
          ) : (
            assets?.map((asset) => {
              return (
                <ListItem
                  key={asset?.name}
                  onClick={() => {
                    dispatch({
                      payload: asset as Asset,
                      type: 'SET_ASSET',
                    });
                    dispatch({
                      payload: Steps.NetworkSelection,
                      type: 'SET_STEP',
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex w-4 justify-center">
                      <CoinLogo
                        height="h-4"
                        name={asset?.name || ''}
                        png={asset?.logo?.png || undefined}
                        svg={asset?.logo?.svg || undefined}
                        width="w-4"
                      />
                    </div>
                    <span>{asset?.name}</span>
                  </div>
                  {asset?.symbol === state.asset?.symbol ? (
                    <i className="fa fa-check-circle text-green-400" />
                  ) : (
                    <i className="fa fa-chevron-right text-xxs" />
                  )}
                </ListItem>
              );
            })
          )}
          {assets?.length ? (
            <InView
              onChange={
                /* istanbul ignore next */ async (inView) => {
                  /* istanbul ignore next */
                  const currentLength = assets?.length || 0;
                  /* istanbul ignore next */
                  if (inView && !atAssetLimit) {
                    /* istanbul ignore next */
                    const more = await fetchMore({
                      variables: {
                        currency: state.fiat,
                        limit: currentLength * 2,
                        offset: currentLength,
                      },
                    });
                    if (more.data.assetsForOrganization?.length === 0) {
                      setAtAssetLimit(true);
                    }
                  }
                }
              }
            >
              {loading ||
              searching ||
              error ||
              isEmptySearch ||
              isSearch ? null : atAssetLimit ? null : (
                <div className="flex w-full items-center justify-center py-2">
                  <i className="fa fa-gear animate-spin text-primary-500" />
                </div>
              )}
            </InView>
          ) : null}
        </div>
      </div>
    </div>
  );
};

type Props = {};

export default AssetSelection;
