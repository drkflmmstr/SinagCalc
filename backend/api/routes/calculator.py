"""
api/routes/calculator.py
────────────────────────
The main calculation endpoint. Thin by design — receives a validated
request, delegates to the calculator modules, returns the result.
"""

from fastapi import APIRouter
from api.schemas import CalculationRequest, CalculationResponse
from calculator.system import size_system
from calculator.financials import calculate_financials
from calculator.environment import calculate_environmental_impact
from config import CLIMATE_ZONES, BILL_BRACKETS

router = APIRouter(tags=["Calculator"])


@router.post(
    "/calculate",
    response_model=CalculationResponse,
    summary="Calculate solar potential",
)
def calculate(req: CalculationRequest) -> CalculationResponse:
    """
    Runs all three calculation modules and returns a complete result.

    The `electricity_rate_php` field is user-supplied — pre-filled from
    the distributor default in the frontend but fully editable. This keeps
    the backend stateless while supporting every Philippine distributor.
    """
    system      = size_system(req.zone, req.roof_area, req.monthly_bill)
    financials  = calculate_financials(
        system, req.monthly_bill, req.quality_tier,
        req.electricity_rate_php, req.system_type
    )
    environment = calculate_environmental_impact(financials["annual_gen_kwh"])

    return CalculationResponse(
        inputs=dict(
            zone=req.zone,
            zone_name=CLIMATE_ZONES[req.zone]["name"],
            roof_area=req.roof_area,
            monthly_bill=req.monthly_bill,
            quality_tier=req.quality_tier,
            monthly_kwh=BILL_BRACKETS[req.monthly_bill]["monthly_kwh"],
            electricity_rate_php=req.electricity_rate_php,
            system_type=req.system_type,
        ),
        system=system,
        financials=financials,
        environment=environment,
        recommendation=_recommendation(system["coverage_pct"], req.system_type),
    )


def _recommendation(coverage_pct: int, system_type: str) -> str:
    battery_note = (
        " The battery storage will cover your night-time usage, "
        "giving you near energy independence."
        if system_type == "hybrid" else ""
    )
    if coverage_pct >= 90:
        return (
            "Solar is an excellent fit for your home. Your roof can accommodate "
            f"a system that covers nearly all your electricity needs.{battery_note}"
        )
    if coverage_pct >= 60:
        return (
            "Solar is a good fit. Your roof can support a system that "
            f"significantly reduces your electricity bill.{battery_note}"
        )
    return (
        "Solar can still help cut your bill, though your available roof space "
        "limits the system size. Even partial coverage delivers real savings "
        f"and a positive environmental impact.{battery_note}"
    )
