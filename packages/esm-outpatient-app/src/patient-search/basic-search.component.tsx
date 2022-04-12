import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { Search, Button, Tile, InlineLoading, Loading } from 'carbon-components-react';
import Search16 from '@carbon/icons-react/es/search/16';
import SearchIllustration from './search-illustration.component';
import SearchResults from './search-results.component';
import { findPatients } from './search.resource';
import { SearchTypes } from '../types';
import styles from './basic-search.scss';

interface BasicSearchProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
}

const BasicSearch: React.FC<BasicSearchProps> = ({ toggleSearchType }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchTimeoutInMs = 300;
  const customRepresentation =
    'custom:(patientId,uuid,identifiers,display,' +
    'patientIdentifier:(uuid,identifier),' +
    'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
    'attributes:(value,attributeType:(name)))';

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeoutInMs), []);

  const performSearch = () => {
    if (searchTerm.length) {
      setIsLoading(true);
      const controller = new AbortController();
      if (searchTerm.length) {
        findPatients(searchTerm, customRepresentation, controller, false)
          .then(({ data }) => {
            const results = data.results.map((res, i) => ({
              ...res,
              index: i + 1,
            }));
            setSearchResults(results);
            setIsLoading(false);
          })
          .finally(() => {
            controller.abort();
          });
      }
    }
  };

  return (
    <div className={searchResults?.length ? styles.lightBackground : styles.resultsContainer}>
      <div className={styles.searchboxContainer}>
        <Search
          autoFocus
          light
          className={styles.searchInput}
          labelText="Search for a patient"
          placeholder={t('searchboxPlaceholder', 'Search for a patient name or ID number')}
          onChange={(event) => handleSearch(event.target.value)}
          onClear={() => setSearchResults([])}
        />
        <Button onClick={performSearch} iconDescription="Basic search" size="field" kind="secondary">
          {t('search', 'Search')}
        </Button>
      </div>
      {searchResults?.length || isLoading ? (
        <div className={styles.resultsContainer}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <InlineLoading description={t('loading', 'Loading...')} />
            </div>
          ) : (
            <SearchResults toggleSearchType={toggleSearchType} patients={searchResults} />
          )}
        </div>
      ) : (
        <div>
          <div className={styles.tileContainer}>
            <Tile className={styles.tile} light>
              <SearchIllustration />
              <div className={styles.helperText}>
                <p className={styles.primaryText}>{t('primaryHelperText', 'Search for a patient')}</p>
                <p className={styles.secondaryText}>
                  {t('secondaryHelperText', "Type the patient's name or unique ID number")}
                </p>
              </div>
            </Tile>
          </div>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <div className={styles.buttonContainer}>
            <Button
              kind="ghost"
              iconDescription="Advanced search"
              renderIcon={Search16}
              onClick={() => toggleSearchType(SearchTypes.ADVANCED)}>
              {t('advancedSearch', 'Advanced search')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicSearch;
