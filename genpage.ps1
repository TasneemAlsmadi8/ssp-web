param (
    [Parameter(Mandatory = $true)]
    [string]$category,

    [Parameter(Mandatory = $true)]
    [string]$pageName
)

# Singularize
$singularCategory = $category.TrimEnd("s")
$singularPageName = $pageName.TrimEnd("s")

# Generate Angular components, interfaces, and services
# ng generate component --standalone "portal/$category/$category-$pageName"
ng generate interface "shared/interfaces/$category/$singularPageName"
ng generate service "shared/services/$category/$singularPageName"
ng generate component --standalone "portal/$category/$category-$pageName/$singularPageName-$singularCategory-details"
ng generate component --standalone "portal/$category/$category-$pageName/new-$singularPageName-$singularCategory"

Write-Output "Components, interface, and service for $category/$pageName have been generated successfully."
