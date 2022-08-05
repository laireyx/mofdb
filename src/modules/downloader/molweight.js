const path = require("path");

const Downloader = require(".");

module.exports = class MolWeightDownloader extends Downloader {
  /**
   * Get fetch option
   * @param {Downloader.DownloadOpts} downloadOpts
   * @return {object}
   */
  getFetchOpts(opts) {
    if (opts.sigma) {
      return {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gql-country": "KR",
          "x-gql-language": "ko",
          "x-gql-operation-name": "ProductSearch",
        },
        body: JSON.stringify({
          operationName: "ProductSearch",
          variables: {
            searchTerm: opts.resource,
            page: 1,
            group: "substance",
            selectedFacets: [],
            sort: "relevance",
            type: "PRODUCT",
          },
          query:
            "query ProductSearch($searchTerm: String, $page: Int!, $sort: Sort, $group: ProductSearchGroup, $selectedFacets: [FacetInput!], $type: ProductSearchType, $catalogType: CatalogType, $orgId: String, $region: String, $facetSet: [String]) {\n  getProductSearchResults(input: {searchTerm: $searchTerm, pagination: {page: $page}, sort: $sort, group: $group, facets: $selectedFacets, type: $type, catalogType: $catalogType, orgId: $orgId, region: $region, facetSet: $facetSet}) {\n    ...ProductSearchFields\n    __typename\n  }\n}\n\nfragment ProductSearchFields on ProductSearchResults {\n  metadata {\n    itemCount\n    setsCount\n    page\n    perPage\n    numPages\n    redirect\n    __typename\n  }\n  items {\n    ... on Substance {\n      ...SubstanceFields\n      __typename\n    }\n    ... on Product {\n      ...SubstanceProductFields\n      __typename\n    }\n    __typename\n  }\n  facets {\n    key\n    numToDisplay\n    isHidden\n    isCollapsed\n    multiSelect\n    prefix\n    options {\n      value\n      count\n      __typename\n    }\n    __typename\n  }\n  didYouMeanTerms {\n    term\n    count\n    __typename\n  }\n  __typename\n}\n\nfragment SubstanceFields on Substance {\n  _id\n  id\n  name\n  synonyms\n  empiricalFormula\n  linearFormula\n  molecularWeight\n  aliases {\n    key\n    label\n    value\n    __typename\n  }\n  images {\n    sequence\n    altText\n    smallUrl\n    mediumUrl\n    largeUrl\n    __typename\n  }\n  casNumber\n  products {\n    ...SubstanceProductFields\n    __typename\n  }\n  match_fields\n  __typename\n}\n\nfragment SubstanceProductFields on Product {\n  name\n  productNumber\n  productKey\n  isSial\n  isMarketplace\n  marketplaceSellerId\n  marketplaceOfferId\n  cardCategory\n  cardAttribute {\n    citationCount\n    application\n    __typename\n  }\n  substance {\n    id\n    __typename\n  }\n  casNumber\n  attributes {\n    key\n    label\n    values\n    __typename\n  }\n  speciesReactivity\n  brand {\n    key\n    erpKey\n    name\n    color\n    __typename\n  }\n  images {\n    altText\n    smallUrl\n    mediumUrl\n    largeUrl\n    __typename\n  }\n  description\n  sdsLanguages\n  sdsPnoKey\n  similarity\n  paMessage\n  features\n  catalogId\n  materialIds\n  __typename\n}\n",
        }),
      };
    } else {
      return {};
    }
  }

  /**
   * Get molecular weight URL from name
   * @param {Downloader.DownloadOpts} opts
   * @returns
   */
  getUrl(opts) {
    const molName = opts.resource;

    if (opts.sigma) {
      return `https://www.sigmaaldrich.com/api`;
    }

    return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${molName}/property/MolecularWeight/TXT`;
  }

  /**
   * Get download path
   * @param {Downloader.DownloadOpts} opts
   * @return {string}
   */
  getDownloadPath(opts) {
    return path.join(this.downloadDir, opts.resource + ".txt");
  }
};
