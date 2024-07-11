import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import fetchShoppingLists from './queries.graphql';
import createShoppingList from './create.graphql';
import DataTableManager from '@commercetools-uikit/data-table-manager';
import DataTable from '@commercetools-uikit/data-table';
import { useFormik } from 'formik';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { FormModalPage } from '@commercetools-frontend/application-components';
import TextField from '@commercetools-uikit/text-field';

const columns = [
  {
    key: 'id',
    label: 'ID',
    renderItem: (row) => (row.id ? row.id : ''),
  },
  {
    key: 'name',
    label: 'Name',
    renderItem: (row) =>
      row.nameAllLocales ? row.nameAllLocales[0].value : '',
  },
];

const ShoppingLists = () => {
  const [modalState, setModalState] = useState(false);

  const formik = useFormik({
    initialValues: {
      locale: '',
      name: '',
    },
    onSubmit: (values, { resetForm }) => {
      handleAddShoppingList(values);
      resetForm({});
      setModalState(false);
    },
    validateOnChange: false,
  });

  const { error, data, loading } = useQuery(fetchShoppingLists, {
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  const options = {
    refetchQueries: [
      {
        query: fetchShoppingLists,
        context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      },
    ],
  };

  const [addShoppingList] = useMutation(createShoppingList, options);

  if (loading) return 'Loading...';
  if (error) return `--Error ${error.message}`;

  console.log(data);

  const handleAddShoppingList = async (formValues) => {
    const { error, data } = await addShoppingList({
      variables: {
        name: formValues.name,
        locale: formValues.locale,
      },
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    });

    if (error) console.log(error.message);
    console.log(data);
  };

  return (
    <>
      <FormModalPage
        title="Manage your shopping lists"
        isOpen={modalState}
        onClose={() => setModalState(false)}
        isPrimaryButtonDisabled={formik.isSubmitting}
        onSecondaryButtonClick={() => setModalState(false)}
        onPrimaryButtonClick={formik.handleSubmit}
      >
        <form onSubmit={formik.handleSubmit}>
          <TextField
            name="name"
            title="Name"
            isRequired={true}
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <TextField
            name="locale"
            title="Locale"
            isRequired={true}
            value={formik.values.locale}
            onChange={formik.handleChange}
          />
        </form>
      </FormModalPage>
      <div>
        <PrimaryButton
          label="Add a shopping list"
          onClick={() => setModalState(true)}
          isDisabled={false}
        />
      </div>

      <DataTableManager columns={columns}>
        <DataTable rows={data?.shoppingLists?.results} />
      </DataTableManager>
    </>
  );
};

export default ShoppingLists;
