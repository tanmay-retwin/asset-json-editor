import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JsonEditorService {
  private jsonDataSubject = new BehaviorSubject<any>(null);
  public jsonData$ = this.jsonDataSubject.asObservable();

  // Store original field for comparison
  private originalJson: any = null;

  constructor() {
    this.loadSampleData();
  }

  getTranslationObj() {
    const currentData = this.getJsonData();
    if (
      currentData &&
      currentData?.translations &&
      Object.keys(currentData?.translations)
    ) {
      return currentData?.translations;
    }
  }

  useTranslation(fieldKey: string = ''): string {
    if (!fieldKey) {
      return '';
    }
    const translationObj = this.getTranslationObj();
    const firstLangCode = Object.keys(translationObj)?.[0];
    const translations = translationObj[firstLangCode];
    return translations[fieldKey] || fieldKey;
  }

  setJsonData(data: any): void {
    this.originalJson = JSON.parse(JSON.stringify(data)); // Create a deep copy
    this.jsonDataSubject.next(data);
  }

  getJsonData(): any {
    return this.jsonDataSubject.value;
  }

  getOriginalJson(): any {
    return this.originalJson;
  }

  loadSampleData(): void {
    const sampleData = {
      sections: {
        overview: {
          zip: {
            units: 'units_text',
            default: '10115',
            datatype: 'text',
            required: true,
            field_name: 'zip_name',
            description: 'zip_desc',
          },
          city: {
            units: 'units_text',
            default: 'Berlin',
            datatype: 'text',
            required: true,
            field_name: 'city_name',
            description: 'city_desc',
          },
          address: {
            units: 'units_text',
            default: 'Germany, Berlin',
            datatype: 'text',
            required: true,
            field_name: 'address_name',
            description: 'address_desc',
          },
        },
        financial: {
          asset_cost: {
            units: 'units_euro_per_kwh',
            limits: {
              max: 1000000,
              min: 0,
            },
            default: 200,
            datatype: 'number',
            required: true,
            field_name: 'asset_cost_name',
            description: 'asset_cost_desc',
          },
        },
        technical: {
          asset_type: {
            default: 'Li-ion',
            datatype: 'text',
            dropdown: ['Li-ion'],
            required: true,
            field_name: 'asset_type_name',
            description: 'asset_type_desc',
          },
        },
        analysis_settings: {
          currency: {
            default: 'Euro',
            datatype: 'text',
            dropdown: ['Euro'],
            required: true,
            field_name: 'currency_name',
            description: 'currency_desc',
          },
          end_date: {
            limits: {
              max: '2050-12-31T23:00:00Z',
              min: '2019-12-31T23:00:00Z',
            },
            default: '2024-07-31T22:00:00Z',
            datatype: 'date',
            required: true,
            field_name: 'end_date_name',
            description: 'end_date_desc',
          },
        },
      },
      translations: {
        en: {
          units_mw: 'MW',
          zip_desc: 'ZIP code of the asset location',
          zip_name: 'ZIP Code',
          city_desc: 'City where the asset is located',
          city_name: 'City',
          units_mwh: 'MWh',
          units_date: 'date',
          units_text: 'text',
          address_desc: 'Full address where the asset is located',
          address_name: 'Address',
          units_cycles: 'cycles',
          currency_desc: 'Currency used for analysis',
          currency_name: 'Currency',
          end_date_desc: 'End Date up to which model is run',
          end_date_name: 'End Date of analysis',
          forecast_desc:
            'Power Market forecast based on fundamental model of the grid',
          forecast_name: 'Fundamental Long Term Forecast',
          location_desc: 'Geographical location details',
          location_name: 'Location',
          units_degrees: 'degrees',
          asset_cost_desc: 'Base unit cost of the asset (e.g. hardware cost)',
          asset_cost_name: 'Asset Unit Cost',
          asset_type_desc: 'Type of energy storage asset',
          asset_type_name: 'Asset Type',
          model_type_desc: 'Type of model used for analysis',
          model_type_name: 'Model Type',
          start_date_desc: 'Starting date from which the model is run',
          start_date_name: 'Start Date of analysis',
          units_mw_per_mw: 'MW/MW',
          solver_name_desc: 'Optimization solver to use',
          solver_name_name: 'Solver Name',
          units_kg_per_mwh: 'kg/MWh of CO2 emitted',
          units_percentage: '%',
          asset_tso_id_desc: 'TSO ID where the asset is located',
          asset_tso_id_name: 'Asset TSO ID',
          market_focus_desc:
            'Ancillary focus = Higher share of BESS capacity allocated to ancillary market',
          market_focus_name: 'Market Focus',
          std_dev_vols_desc:
            'Volume fluctuations as a percentage from the actual value',
          std_dev_vols_name: 'Standard Deviation of Volumes',
          asset_cost_om_desc:
            'Yearly Ops and maintenance cost as a % of unit cost',
          asset_cost_om_name: 'Asset O&M Cost',
          asset_country_desc: 'Country code where the asset is located',
          asset_country_hint: 'Use ISO country codes',
          asset_country_name: 'Asset Country',
          asset_max_soc_desc: 'Maximum allowable state of charge',
          asset_max_soc_name: 'Maximum State of Charge',
          asset_min_soc_desc: 'Minimum allowable state of charge in analysis',
          asset_min_soc_name: 'Minimum State of Charge',
          asset_offtake_desc: 'Available offtake options',
          asset_offtake_name: 'Asset Offtake Options',
          forecast_name_desc: 'Type of forecast to use',
          forecast_name_name: 'Forecast Type',
          risk_appetite_desc:
            'High Risk = Large volume bids with lower acceptance chance',
          risk_appetite_name: 'Risk Appetite',
          units_euro_per_kwh: 'Euro/kWh',
          units_kg_co2_per_j: 'kg/J of CO2',
          asset_capacity_desc: 'Storage capacity of the asset',
          asset_capacity_name: 'Asset Capacity',
          std_dev_prices_desc:
            'Price fluctuations as a percentage from the actual value',
          std_dev_prices_name: 'Standard Deviation of Prices',
          asset_final_soc_desc: 'State of charge at the end of analysis',
          asset_final_soc_name: 'Final State of Charge',
          asset_inflation_desc: 'Inflation % assumed for the asset YoY',
          asset_inflation_name: 'Asset Inflation',
          model_DA_energy_desc:
            '{"title": "Day Ahead (DA)", "body": "Trades electricity in hourly intervals with daily auctions. Gate closure is at 12 Noon CET for delivery the following day.", "link": "https://docs.re-twin.energy/markets/day-ahead"}',
          model_DA_energy_name: 'Day Ahead',
          units_cycles_per_day: 'cycles/day',
          bidding_strategy_desc: 'Conservative or High Risk for bidding',
          bidding_strategy_name: 'Bidding Strategy',
          carbon_intensity_desc: 'Carbon intensity of the asset',
          carbon_intensity_name: 'Carbon Intensity',
          forecast_horizon_desc: 'Number of days ahead to be used for planning',
          forecast_horizon_name: 'Forecast Horizon',
          units_cycles_per_year: 'cycles/year',
          asset_direct_cost_desc:
            'Added Direct Costs as % of unit cost (e.g. DevEx, EPC etc.)',
          asset_direct_cost_name: 'Asset Direct Costs ',
          asset_initial_soc_desc:
            'Initial state of charge at start of analysis',
          asset_initial_soc_name: 'Initial State of Charge',
          asset_irr_nominal_desc: 'Nominal internal rate of return target',
          asset_irr_nominal_name: 'Nominal IRR',
          asset_location_lat_desc: 'Latitude of asset location',
          asset_location_lat_name: 'Latitude',
          asset_power_rating_desc: 'Power rating of the asset',
          asset_power_rating_name: 'Asset Power Rating',
          asset_wacc_nominal_desc: 'Nominal weighted average cost of capital',
          asset_wacc_nominal_name: 'Nominal WACC',
          model_FCR_capacity_desc:
            '{"title": "Frequency Containment Reserve (FCR)", "body": "Responds automatically to grid frequency deviations (49.99–50.01 Hz) with daily pay-as-cleared auctions with gate closure at 8 AM for following day", "link": "https://docs.re-twin.energy/markets/ancillary-services/fcr"}',
          model_FCR_capacity_name: 'FCR',
          asset_indirect_cost_desc:
            'Added Indirect Costs as % of unit cost (e.g. contingencies)',
          asset_indirect_cost_name: 'Asset Indirect Costs ',
          asset_location_long_desc: 'Longitude of asset location',
          asset_location_long_name: 'Longitude',
          asset_operation_end_desc:
            'Date on which asset operation is planned to end',
          asset_operation_end_name: 'Operation End Date',
          asset_cost_escalation_desc:
            'Annual escalation as a % of base asset cost',
          asset_cost_escalation_name: 'Cost Escalation',
          asset_operation_start_desc:
            'Date on which asset begins operational phase',
          asset_operation_start_name: 'Operation Start Date',
          asset_soh_end_of_life_desc:
            'The expected state of health at end of life as a % of beginning of life',
          asset_soh_end_of_life_name: 'State of Health at the End of Life',
          da_power_rating_limit_desc: 'Maximum power rating for DA Market',
          da_power_rating_limit_name: 'DA Power Rating Limit',
          grid_emissions_factor_desc:
            'Average emissions factor of the grid in kilograms of CO₂ per MWh',
          grid_emissions_factor_name: 'Grid Emissions Factor',
          model_aFRR_NEG_energy_desc:
            '{"title": "aFRR Energy Negative", "body": "Downward regulation reserve; power is withdrawn from the grid to maintain frequency balance. Participants receive compensation for reducing generation or increasing consumption when activated."}',
          model_aFRR_NEG_energy_name: 'aFRR Energy Negative',
          model_aFRR_POS_energy_desc:
            '{"title": "aFRR Energy Positive", "body": "Upward regulation reserve; power is injected into the grid to balance frequency deviations. Participants receive compensation for increasing generation or reducing consumption when requested."}',
          model_aFRR_POS_energy_name: 'aFRR Energy Positive',
          asset_construction_end_desc:
            'Date on which asset construction completes',
          asset_construction_end_name: 'Construction End Date',
          fcr_power_rating_limit_desc: 'Maximum power rating for FCR Market',
          fcr_power_rating_limit_name: 'FCR Power Rating Limit',
          idc_power_rating_limit_desc:
            'Maximum power rating for ID Continuous Market',
          idc_power_rating_limit_name: 'ID Continuous Power Rating Limit',
          model_imbalance_energy_desc:
            '{"title": "Imbalance Market", "body": "Real-time market where deviations from scheduled positions are settled. Participants pay or receive imbalance prices based on their shortfall or surplus against actual system needs."}',
          model_imbalance_energy_name: 'Imbalance Market',
          aFRR_power_rating_limit_desc: 'Maximum power rating for aFRR Market',
          aFRR_power_rating_limit_name: 'aFRR Power Rating Limit',
          asset_soh_start_of_life_desc:
            'The expected state of health at start of life as a % of beginning of life',
          asset_soh_start_of_life_name: 'State of Health at the Start of Life',
          mFRR_power_rating_limit_desc: 'Maximum power rating for mFRR Market',
          mFRR_power_rating_limit_name: 'mFRR Power Rating Limit',
          model_aFRR_NEG_capacity_desc:
            '{"title": "aFRR Negative Capacity", "body": "Responds to frequency rises (>50 Hz) by reducing feed-in or consuming power with pay-as-bid with gate closure at 9 AM for following day", "link": "https://docs.re-twin.energy/markets/ancillary-services/afrr"}',
          model_aFRR_NEG_capacity_name: 'aFRR Negative Capacity',
          model_aFRR_POS_capacity_desc:
            '{"title": "aFRR Positive Capacity", "body": "Responds to frequency drops (<50 Hz) by feeding power into the grid with pay-as-bid auctions with gate closure at 9 AM for following day", "link": "https://docs.re-twin.energy/markets/ancillary-services/afrr"}',
          model_aFRR_POS_capacity_name: 'aFRR Positive Capacity',
          model_idc_hourly_energy_desc:
            '{"title": "Intraday Continuous Hourly", "body": "Trades electricity in continuous hourly contracts. For EPEX, gate closure is up to 5 minutes before delivery, varying by country. Prices adjust dynamically based on real-time trading."}',
          model_idc_hourly_energy_name: 'Intraday Continuous Hourly',
          model_mFRR_NEG_capacity_desc:
            '{"title": "mFRR Negative Capacity", "body": "Responds to sustained frequency rises (>50 Hz) with manual activation and pay-as-bid pricing with gate closure at 10 AM for following day", "link": "https://docs.re-twin.energy/markets/ancillary-services/mfrr"}',
          model_mFRR_NEG_capacity_name: 'mFRR Negative Capacity',
          model_mFRR_POS_capacity_desc:
            '{"title": "mFRR Positive Capacity", "body": "Responds to sustained frequency drops (<50 Hz) with manual activation and pay-as-bid pricing with gate closure at 10 AM for following day", "link": "https://docs.re-twin.energy/markets/ancillary-services/mfrr"}',
          model_mFRR_POS_capacity_name: 'mFRR Positive Capacity',
          asset_construction_start_desc:
            'Date on which asset construction begins',
          asset_construction_start_name: 'Construction Start Date',
          asset_debt_interest_rate_desc: 'Interest Rate on Debt',
          asset_debt_interest_rate_name: 'Asset Debt Rate',
          model_investment_horizon_desc:
            'Schedule the asset on a daily/weekly basis',
          model_investment_horizon_name: 'Investment Horizon',
          asset_charging_efficiency_desc: 'Charging efficiency of the asset',
          asset_charging_efficiency_name: 'Asset Charging Efficiency',
          asset_degradation_enabled_desc:
            'If enabled: Degradation impacts revenues on yearly basis',
          asset_degradation_enabled_name: 'Enable Degradation (Yearly basis)',
          renewable_emissions_factor_desc:
            'Emissions factor for renewable energy in kilograms of CO₂ per MWh',
          renewable_emissions_factor_name: 'Renewable Emissions Factor',
          asset_degradation_as_cycles_desc:
            'Expected degradation of the asset as a % of initial degradation on a cycle basis',
          asset_degradation_as_cycles_name:
            'Asset Degradation with Number of Cycles',
          asset_allowed_cycles_per_day_desc:
            'Maximum number of charge/discharge cycles permitted daily',
          asset_allowed_cycles_per_day_name: 'Allowed Cycles per Day',
          asset_allowed_power_capacity_desc:
            'Due to grid constraints, the actual power capacity could be lower than total power capacity',
          asset_allowed_power_capacity_name:
            'Substation Capacity (% of Power Rating)',
          asset_discharging_efficiency_desc:
            'Discharging efficiency of the asset',
          asset_discharging_efficiency_name: 'Asset Discharging Efficiency',
          model_idc_half_hourly_energy_desc:
            'ID market with 1/2 hour contracts',
          model_idc_half_hourly_energy_name: 'Intraday Continuous Half Hourly',
          asset_allowed_cycles_per_year_desc:
            'Maximum number of charge/discharge cycles permitted annually',
          asset_allowed_cycles_per_year_name: 'Allowed Cycles per Year',
          model_idc_quarter_hourly_energy_desc:
            'ID market with 1/4 hour contracts',
          model_idc_quarter_hourly_energy_name:
            'Intraday Continuous Quarter Hourly',
          model_intraday_auction_1_energy_desc:
            '{"title": "Intraday Auction 1", "body": "Trades hourly electricity in a daily auction. For EPEX, gate closure is 3 PM CET for next-day delivery. Prices are set based on supply and demand."}',
          model_intraday_auction_1_energy_name: 'Intraday Auction 1',
          asset_total_cycles_over_lifetime_desc:
            'Total Cycles over the lifetime',
          asset_total_cycles_over_lifetime_name: 'Total Cycles Over Lifetime',
          model_idc_financial_trades_energy_desc:
            '{"title": "Intraday Continuous Temporal Arbitrage", "body": "Profit by buying and selling in the intraday continuous market at different times while keeping a net-zero position, exploiting price fluctuations without taking long-term exposure."}',
          model_idc_financial_trades_energy_name:
            'Intraday Continuous Temporal Arbitrage',
          participation_in_ancillary_markets_desc:
            'Indicates whether the asset participates in ancillary service markets',
          participation_in_ancillary_markets_name:
            'Participation in Ancillary Markets',
          model_idc_financial_trades_spread_factor_desc:
            'Proportion of total spread possible on the VWAP',
          model_idc_financial_trades_spread_factor_name:
            'Spread Factor for Temporal Arbitrage',
          model_idc_financial_trades_volume_factor_desc:
            'Proportion of total BESS power rating',
          model_idc_financial_trades_volume_factor_name:
            'Volume Factor for Temporal Arbitrage',
        },
      },
    };

    this.setJsonData(sampleData);
  }

  addField(
    section: string,
    subsection: string | null,
    fieldName: string,
    fieldData: any
  ): void {
    const currentData = this.getJsonData();

    if (!currentData || !currentData.sections) {
      console.error('Invalid JSON structure');
      return;
    }

    if (!currentData.sections[section]) {
      currentData.sections[section] = {};
    }

    if (subsection) {
      if (!currentData.sections[section][subsection]) {
        currentData.sections[section][subsection] = {};
      }
      currentData.sections[section][subsection][fieldName] = fieldData;
    } else {
      currentData.sections[section][fieldName] = fieldData;
    }

    this.jsonDataSubject.next({ ...currentData });
  }

  updateField(
    section: string,
    subsection: string | null,
    fieldName: string,
    fieldData: any
  ): void {
    const currentData = this.getJsonData();
    if (!currentData) return;

    if (subsection) {
      // Update in nested subsection
      currentData.sections[section][subsection][fieldName] = fieldData;
    } else {
      // Update directly in section
      currentData.sections[section][fieldName] = fieldData;
    }

    this.jsonDataSubject.next(currentData);
  }

  updateFieldValue(
    section: string,
    subsection: string | null,
    fieldName: string,
    path: string[],
    value: any
  ): void {
    const currentData = this.getJsonData();
    if (!currentData) return;

    let fieldObj;
    if (subsection) {
      // Get field in nested subsection
      fieldObj = currentData.sections[section][subsection][fieldName];
    } else {
      // Get field directly in section
      fieldObj = currentData.sections[section][fieldName];
    }

    // Update the value at the specified path
    let current = fieldObj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    // Update the data
    this.jsonDataSubject.next(currentData);
  }

  deleteField(
    section: string,
    subsection: string | null,
    fieldName: string
  ): void {
    const currentData = this.getJsonData();

    if (
      !currentData ||
      !currentData.sections ||
      !currentData.sections[section]
    ) {
      console.error('Invalid path or section does not exist');
      return;
    }

    if (subsection) {
      if (!currentData.sections[section][subsection]) {
        console.error('Subsection does not exist');
        return;
      }
      if (currentData.sections[section][subsection][fieldName]) {
        delete currentData.sections[section][subsection][fieldName];
      }
    } else {
      if (currentData.sections[section][fieldName]) {
        delete currentData.sections[section][fieldName];
      }
    }

    this.jsonDataSubject.next({ ...currentData });
  }

  getSections(): string[] {
    const currentData = this.getJsonData();
    if (!currentData || !currentData.sections) {
      return [];
    }
    return Object.keys(currentData.sections);
  }

  getFieldsInSection(section: string, subsection: string | null = null): any {
    const currentData = this.getJsonData();
    if (
      !currentData ||
      !currentData.sections ||
      !currentData.sections[section]
    ) {
      return {};
    }

    if (subsection) {
      return currentData.sections[section][subsection] || {};
    }

    return currentData.sections[section];
  }

  generateFieldTemplate(dataType: string = 'text'): any {
    const template: any = {
      datatype: dataType,
      required: false,
      field_name: '',
      description: '',
    };

    switch (dataType) {
      case 'number':
        template.units = 'units_text';
        template.limits = {
          max: 100,
          min: 0,
        };
        template.default = 0;
        break;
      case 'text':
        template.units = 'units_text';
        template.default = '';
        break;
      case 'date':
        template.units = 'units_date';
        template.limits = {
          max: new Date().toISOString(),
          min: new Date(
            new Date().setFullYear(new Date().getFullYear() - 10)
          ).toISOString(),
        };
        template.default = new Date().toISOString();
        break;
      default:
        template.default = '';
    }

    return template;
  }

  exportJsonData(): string {
    const currentData = this.getJsonData();
    return JSON.stringify(currentData, null, 2);
  }
}
