import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { EuiPageHeader, EuiButton, EuiSpacer, EuiPanel } from '@elastic/eui';

import { CoreStart } from '../../../../../../src/core/public';
import { ModelSearchItem } from '../../apis/model';
import { APIProvider } from '../../apis/api_provider';

import { ModelTable } from './model_table';
import { ModelListFilter } from './model_list_filter';

export const ModelList = ({ notifications }: { notifications: CoreStart['notifications'] }) => {
  const [models, setModels] = useState<ModelSearchItem[]>([]);
  const [totalModelCounts, setTotalModelCount] = useState(0);
  const [params, setParams] = useState<{
    algorithms?: string[];
    context?: { [key: string]: Array<string | number> };
    currentPage: number;
    pageSize: number;
  }>({
    currentPage: 1,
    pageSize: 15,
  });

  const pagination = useMemo(
    () => ({
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      totalRecords: totalModelCounts,
    }),
    [totalModelCounts, params.currentPage, params.pageSize]
  );

  const handlePaginationChange = useCallback(
    (pagination: { currentPage: number; pageSize: number }) => {
      setParams((previousValue) => {
        if (
          previousValue.currentPage === pagination.currentPage &&
          previousValue.pageSize === pagination.pageSize
        ) {
          return previousValue;
        }
        return {
          ...previousValue,
          ...pagination,
        };
      });
    },
    []
  );

  const handleModelDeleted = useCallback(async () => {
    const payload = await APIProvider.getAPI('model').search(params);
    setModels(payload.data);
    setTotalModelCount(payload.pagination.totalRecords);
    notifications.toasts.addSuccess('Model has been deleted.');
  }, [pagination.currentPage, pagination.pageSize]);

  const handleAlgorithmsChange = useCallback(
    (algorithms: string[] | undefined) => {
      setParams((previousValue) => ({ ...previousValue, algorithms, context: undefined }));
    },
    [setParams]
  );

  const handleContextChange = useCallback((context) => {
    setParams((previousValue) => ({ ...previousValue, context }));
  }, []);

  useEffect(() => {
    APIProvider.getAPI('model')
      .search(params)
      .then((payload) => {
        setModels(payload.data);
        setTotalModelCount(payload.pagination.totalRecords);
      });
  }, [params]);

  return (
    <EuiPanel>
      <EuiPageHeader
        pageTitle="Models"
        rightSideItems={[<EuiButton fill>Train new model</EuiButton>]}
        bottomBorder
      />
      <EuiSpacer />
      <ModelListFilter
        context={params.context}
        algorithms={params.algorithms}
        onContextChange={handleContextChange}
        onAlgorithmsChange={handleAlgorithmsChange}
      />
      <EuiSpacer />
      <ModelTable
        models={models}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onModelDeleted={handleModelDeleted}
      />
    </EuiPanel>
  );
};
